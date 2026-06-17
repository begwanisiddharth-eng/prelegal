import { test, expect } from '@playwright/test'

const LOGIN_FLAG = 'prelegal.loggedIn'
const TEMPLATE_MD = '# Sample Agreement\n\nGoverned by <span class="coverpage_link">Governing Law</span> law.'

test('redirects to the login page when not authenticated', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveURL(/\/login/)
  await expect(page.getByRole('heading', { name: 'Sign in to Prelegal' })).toBeVisible()
})

test.describe('document creator (authenticated)', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript((flag) => {
      window.localStorage.setItem(flag, 'true')
    }, LOGIN_FLAG)
  })

  test('shows the greeting and the empty preview state', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText(/help you draft a legal document/)).toBeVisible()
    await expect(page.getByText(/Your document will appear here/)).toBeVisible()
  })

  test('choosing a document renders the template with filled placeholders', async ({ page }) => {
    await page.route('**/api/chat', (route) =>
      route.fulfill({
        json: { reply: 'Selected.', document: 'Mutual-NDA.md', fields: [{ name: 'Governing Law', value: 'Delaware' }] },
      }),
    )
    await page.route('**/api/templates/**', (route) =>
      route.fulfill({ json: { filename: 'Mutual-NDA.md', markdown: TEMPLATE_MD, placeholders: ['Governing Law'] } }),
    )
    await page.goto('/')
    await page.getByLabel('Message').fill('I need an NDA')
    await page.getByRole('button', { name: 'Send' }).click()

    await expect(page.getByText('Selected.')).toBeVisible()
    await expect(page.getByText('Sample Agreement')).toBeVisible()
    // The placeholder was filled from the chat fields.
    await expect(page.getByText('Governed by Delaware law.')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Download PDF' })).toBeVisible()
  })

  test('downloads a PDF named after the document', async ({ page }) => {
    await page.route('**/api/chat', (route) =>
      route.fulfill({ json: { reply: 'Selected.', document: 'Mutual-NDA.md', fields: [] } }),
    )
    await page.route('**/api/templates/**', (route) =>
      route.fulfill({ json: { filename: 'Mutual-NDA.md', markdown: TEMPLATE_MD, placeholders: ['Governing Law'] } }),
    )
    await page.goto('/')
    await page.getByLabel('Message').fill('NDA please')
    await page.getByRole('button', { name: 'Send' }).click()
    await expect(page.getByRole('button', { name: 'Download PDF' })).toBeVisible()

    const downloadPromise = page.waitForEvent('download')
    await page.getByRole('button', { name: 'Download PDF' }).click()
    const download = await downloadPromise
    expect(download.suggestedFilename()).toBe('mutual-nda.pdf')
  })
})

import { test, expect, type Page } from '@playwright/test'

const TOKEN_KEY = 'prelegal.token'
const TEMPLATE_MD = '# Sample Agreement\n\nGoverned by <span class="coverpage_link">Governing Law</span> law.'

async function seedToken(page: Page) {
  await page.addInitScript((key) => {
    window.localStorage.setItem(key, 'test-token')
  }, TOKEN_KEY)
}

async function mockChatAndTemplate(page: Page, fields: { name: string; value: string }[]) {
  await page.route('**/api/chat', (route) =>
    route.fulfill({ json: { reply: 'Selected.', document: 'Mutual-NDA.md', fields } }),
  )
  await page.route('**/api/templates/**', (route) =>
    route.fulfill({ json: { filename: 'Mutual-NDA.md', markdown: TEMPLATE_MD, placeholders: ['Governing Law'] } }),
  )
}

test('redirects to login when not authenticated', async ({ page }) => {
  await page.goto('/create')
  await expect(page).toHaveURL(/\/login/)
  await expect(page.getByRole('heading', { name: 'Sign in to Prelegal' })).toBeVisible()
})

test.describe('authenticated', () => {
  test.beforeEach(async ({ page }) => {
    await seedToken(page)
  })

  test('home shows the two options', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('button', { name: 'Start New Conversation' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Download Saved Documents' })).toBeVisible()
  })

  test('creator fills the preview and reveals Save / Generate PDF', async ({ page }) => {
    await mockChatAndTemplate(page, [{ name: 'Governing Law', value: 'Delaware' }])
    await page.goto('/create')
    await page.getByLabel('Message').fill('I need an NDA')
    await page.getByRole('button', { name: 'Send' }).click()

    await expect(page.getByText('Governed by Delaware law.')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Save' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Generate PDF' })).toBeVisible()
  })

  test('Save opens the custom name dialog and saves', async ({ page }) => {
    await mockChatAndTemplate(page, [])
    await page.route('**/api/documents', (route) =>
      route.fulfill({ json: { id: 1, name: 'My NDA', document: 'Mutual-NDA.md', fields: [], updated_at: '2026-06-18T00:00:00Z' } }),
    )
    await page.goto('/create')
    await page.getByLabel('Message').fill('NDA')
    await page.getByRole('button', { name: 'Send' }).click()
    await page.getByRole('button', { name: 'Save' }).click()

    await expect(page.getByText('Save document')).toBeVisible()
    await page.getByLabel('Name this document').fill('My NDA')
    await page.getByRole('button', { name: 'Save' }).last().click()
    // Dialog closes after saving.
    await expect(page.getByText('Save document')).toHaveCount(0)
  })

  test('Generate PDF with unsaved changes warns, then downloads', async ({ page }) => {
    await mockChatAndTemplate(page, [{ name: 'Governing Law', value: 'Delaware' }])
    await page.goto('/create')
    await page.getByLabel('Message').fill('NDA')
    await page.getByRole('button', { name: 'Send' }).click()
    await page.getByRole('button', { name: 'Generate PDF' }).click()

    await expect(page.getByRole('heading', { name: 'Unsaved changes' })).toBeVisible()
    const downloadPromise = page.waitForEvent('download')
    await page.getByRole('button', { name: 'OK' }).click()
    const download = await downloadPromise
    expect(download.suggestedFilename()).toBe('mutual-nda.pdf')
  })

  test('saved documents screen lists and downloads', async ({ page }) => {
    await page.route('**/api/documents', (route) =>
      route.fulfill({
        json: [{ id: 1, name: 'My NDA', document: 'Mutual-NDA.md', fields: [], updated_at: '2026-06-18T00:00:00Z' }],
      }),
    )
    await page.route('**/api/templates/**', (route) =>
      route.fulfill({ json: { filename: 'Mutual-NDA.md', markdown: TEMPLATE_MD, placeholders: ['Governing Law'] } }),
    )
    await page.goto('/saved')

    await expect(page.getByText('My NDA')).toBeVisible()
    const downloadPromise = page.waitForEvent('download')
    await page.getByRole('button', { name: 'Download' }).click()
    const download = await downloadPromise
    expect(download.suggestedFilename()).toBe('mutual-nda.pdf')
  })
})

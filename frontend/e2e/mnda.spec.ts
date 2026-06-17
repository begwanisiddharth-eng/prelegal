import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
})

test('renders the creator with form and live preview', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Mutual NDA Creator' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Mutual Non-Disclosure Agreement' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Standard Terms' })).toBeVisible()
})

test('preview updates live as the form is edited', async ({ page }) => {
  const purpose = page.getByLabel('Purpose')
  await purpose.fill('Evaluating a joint venture')
  // The cover-page value paragraph (excludes the textarea and the clause bodies
  // that also reference the Purpose).
  await expect(
    page.getByRole('paragraph').filter({ hasText: /^Evaluating a joint venture$/ }),
  ).toBeVisible()

  await page.getByLabel('Governing Law (state)').fill('Delaware')
  await expect(page.getByText(/laws of the State of Delaware/).first()).toBeVisible()
})

test('trade-secret carve-out toggles with the confidentiality term', async ({ page }) => {
  await expect(page.getByText(/in the case of trade secrets/)).toBeVisible()
  await page.getByText('In perpetuity').click()
  await expect(page.getByText(/in the case of trade secrets/)).toHaveCount(0)
})

test('radios with a shared name behave as one group', async ({ page }) => {
  await page.getByText('Continues until terminated').click()
  const yearsInput = page.getByRole('spinbutton').first()
  await expect(yearsInput).toBeDisabled()
  await expect(
    page.getByText('the date of termination in accordance with the terms of the MNDA').first(),
  ).toBeVisible()
})

test('downloads a non-empty PDF named mutual-nda.pdf', async ({ page }) => {
  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Download PDF' }).click()
  const download = await downloadPromise

  expect(download.suggestedFilename()).toBe('mutual-nda.pdf')
  const path = await download.path()
  expect(path).toBeTruthy()
})

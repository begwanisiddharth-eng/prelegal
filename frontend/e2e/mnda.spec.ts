import { test, expect } from '@playwright/test'

const LOGIN_FLAG = 'prelegal.loggedIn'

// A complete MNDA fields object, matching what the backend always returns.
const baseFields = {
  purpose: '',
  effectiveDate: '2026-01-01',
  mndaTermType: 'fixed',
  mndaTermYears: '1',
  confidentialityTermType: 'fixed',
  confidentialityTermYears: '1',
  governingLaw: '',
  jurisdiction: '',
  party1: { printName: '', title: '', company: '', noticeAddress: '', date: '' },
  party2: { printName: '', title: '', company: '', noticeAddress: '', date: '' },
}

test('redirects to the login page when not authenticated', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveURL(/\/login/)
  await expect(page.getByRole('heading', { name: 'Sign in to Prelegal' })).toBeVisible()
})

test.describe('MNDA creator (authenticated)', () => {
  test.beforeEach(async ({ page }) => {
    // Seed the login flag directly so the creator tests don't need the backend.
    await page.addInitScript((flag) => {
      window.localStorage.setItem(flag, 'true')
    }, LOGIN_FLAG)
  })

  test('renders the chat and the live preview', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: 'Mutual NDA Creator' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Mutual Non-Disclosure Agreement' })).toBeVisible()
    await expect(page.getByText(/help you put together a Mutual NDA/)).toBeVisible()
  })

  test('a chat answer updates the live preview', async ({ page }) => {
    await page.route('**/api/chat', async (route) => {
      await route.fulfill({
        json: { reply: 'Got it.', fields: { ...baseFields, governingLaw: 'Delaware' } },
      })
    })
    await page.goto('/')
    await page.getByLabel('Message').fill('Governing law is Delaware')
    await page.getByRole('button', { name: 'Send' }).click()

    await expect(page.getByText('Got it.')).toBeVisible()
    await expect(page.getByText(/laws of the State of Delaware/).first()).toBeVisible()
  })

  test('trade-secret carve-out toggles when the term becomes perpetual', async ({ page }) => {
    await page.route('**/api/chat', async (route) => {
      await route.fulfill({
        json: { reply: 'Updated.', fields: { ...baseFields, confidentialityTermType: 'perpetuity' } },
      })
    })
    await page.goto('/')
    await expect(page.getByText(/in the case of trade secrets/)).toBeVisible()

    await page.getByLabel('Message').fill('Make confidentiality perpetual')
    await page.getByRole('button', { name: 'Send' }).click()

    await expect(page.getByText(/in the case of trade secrets/)).toHaveCount(0)
  })

  test('downloads a non-empty PDF named mutual-nda.pdf', async ({ page }) => {
    await page.goto('/')
    const downloadPromise = page.waitForEvent('download')
    await page.getByRole('button', { name: 'Download PDF' }).click()
    const download = await downloadPromise

    expect(download.suggestedFilename()).toBe('mutual-nda.pdf')
    const path = await download.path()
    expect(path).toBeTruthy()
  })
})

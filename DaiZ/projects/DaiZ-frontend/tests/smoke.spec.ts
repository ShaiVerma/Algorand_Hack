import { test, expect } from '@playwright/test'

test('landing loads and CTA works', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText('Open DAISY')).toBeVisible()
  await page.getByText('Open DAISY').click()
  await expect(page).toHaveURL(/.*\/app$/)
})


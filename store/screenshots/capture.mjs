import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import { dirname, join, basename } from 'path'
import { readdirSync } from 'fs'

const __dirname = dirname(fileURLToPath(import.meta.url))

const browser = await chromium.launch()
const page = await browser.newPage()
await page.setViewportSize({ width: 1280, height: 800 })

const htmlFiles = readdirSync(__dirname)
  .filter(f => f.startsWith('screenshot-') && f.endsWith('.html'))
  .sort()

for (const file of htmlFiles) {
  const htmlPath = join(__dirname, file)
  const pngPath = join(__dirname, file.replace('.html', '.png'))
  await page.goto(`file://${htmlPath}`)
  // Wait for Google Fonts to load (or timeout after 3s)
  await page.waitForLoadState('networkidle').catch(() => {})
  await page.screenshot({ path: pngPath, clip: { x: 0, y: 0, width: 1280, height: 800 } })
  console.log(`Captured: ${basename(pngPath)}`)
}

await browser.close()
console.log('Done — check store/screenshots/ for PNG files')

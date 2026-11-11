// Run with PLAYWRIGHT_MODULE pointing to an installed Playwright package.
// Start the local server described in README.md first.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    for (const width of [1440, 390, 320]) {
      const page = await browser.newPage({ viewport: { width, height: 900 } });
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.goto(process.env.SITE_URL || 'http://127.0.0.1:8000');
      assert.equal(await page.locator('ol > li').count(), 10);
      assert.equal(await page.locator('h1').textContent(), 'Kindred Hours');
      const bodySize = await page.locator('.story p').first().evaluate(e => parseFloat(getComputedStyle(e).fontSize));
      assert(bodySize >= 16 && bodySize <= 19.2, `body text size: ${bodySize}`);
      const titleSize = await page.locator('h1').evaluate(e => parseFloat(getComputedStyle(e).fontSize));
      assert(titleSize <= 96, `title size: ${titleSize}`);
      assert.equal(await page.evaluate(() => getComputedStyle(document.body).color), 'rgb(55, 77, 109)');
      assert.equal(await page.evaluate(() => getComputedStyle(document.documentElement).backgroundColor), 'rgb(246, 238, 227)');
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `overflow at ${width}`);
      const total = await page.locator('.reveal-char').count();
      const initial = await page.locator('.is-visible').count();
      assert(total > 2000 && initial < total);
      await page.evaluate(() => {
        document.documentElement.style.scrollBehavior = 'auto';
        scrollTo(0, 1400);
      });
      await page.waitForTimeout(200);
      assert(await page.locator('.is-visible').count() > initial);
      await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
      await page.waitForTimeout(200);
      assert.equal(await page.locator('.reveal-char.is-visible').count(), total);
      assert.equal(await page.locator('.kindred-phrase.is-awake').count(), 2);
      await page.evaluate(() => scrollTo(0, 0));
      await page.waitForTimeout(250);
      assert.equal(await page.locator('.reveal-char.is-visible').count(), initial);
      assert.equal(await page.locator('.kindred-phrase.is-awake').count(), 0);
      const dimOpacity = await page.locator('.reveal-char:not(.is-visible)').first().evaluate(e => getComputedStyle(e).opacity);
      assert.equal(dimOpacity, '0.1');
      await page.mouse.wheel(0, 800);
      await page.waitForTimeout(350);
      assert(await page.locator('.reveal-char.is-visible').count() > initial);
      await page.locator('.motion-toggle').click();
      await page.waitForTimeout(100);
      assert.equal(await page.locator('.reveal-char.is-visible').count(), total);
      await page.locator('.sr-only a').focus();
      assert(await page.locator('.sr-only a').isVisible());
      assert.equal(await page.locator('.sr-only a').getAttribute('href'), 'tel:+14373837187');
      assert.deepEqual(errors, []);
      await page.screenshot({ path: `/tmp/kindred-hours-${width}.png`, fullPage: true });
      console.log(`PASS ${width}px: palette, content, wrapping, scrolling, accent, keyboard link; ${total} letters`);
      await page.close();
    }
    const reduced = await browser.newPage({ reducedMotion: 'reduce' });
    await reduced.goto(process.env.SITE_URL || 'http://127.0.0.1:8000');
    assert.equal(await reduced.locator('.reveal-char').count(), await reduced.locator('.reveal-char.is-visible').count());
    assert.equal(await reduced.locator('.title-accent').evaluate(e => getComputedStyle(e, '::after').animationName), 'none');
    await reduced.locator('.motion-toggle').click();
    await reduced.waitForTimeout(250);
    assert(await reduced.locator('.reveal-char.is-visible').count() < await reduced.locator('.reveal-char').count());
    assert.equal(await reduced.locator('.reveal-char:not(.is-visible)').first().evaluate(e => getComputedStyle(e).opacity), '0.1');
    console.log('PASS reduced motion');
    const nojs = await browser.newPage({ javaScriptEnabled: false });
    await nojs.goto(process.env.SITE_URL || 'http://127.0.0.1:8000');
    assert.equal(await nojs.locator('ol > li').count(), 10);
    assert(await nojs.locator('a[href="tel:+14373837187"]').isVisible());
    console.log('PASS no-JavaScript fallback');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exit(1); });
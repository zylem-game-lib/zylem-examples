import { expect, test } from '@playwright/test';
import { catalog } from '../../src/example-catalog';

test.setTimeout(150_000);
test.beforeEach(({}, testInfo) => {
  test.skip(
    testInfo.project.name.includes('Mobile'),
    'Desktop catalog and rendering coverage',
  );
});

test('shows only the three curated sections and thirty demos', async ({
  page,
}) => {
  await page.goto('/');
  await expect(
    page.locator('[data-side-panel] button.sidebar-item'),
  ).toHaveCount(30);
  for (const name of ['Game Demos', 'Remakes', 'Basic']) {
    await expect(
      page
        .locator('[data-side-panel]')
        .getByRole('button', { name: new RegExp(`^${name}`) })
        .first(),
    ).toBeVisible();
  }
  await expect(
    page.locator('[data-side-panel]').getByText('Misc', { exact: true }),
  ).toHaveCount(0);
});

for (const { id, name, legacyIds } of catalog) {
  test(`loads ${name} and recreates it on restart`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(`/demos/${id}`);
    await expect(page.locator('zylem-game')).toHaveAttribute(
      'data-demo-id',
      id,
    );
    await expect(page.locator('[data-demo-loading-overlay]')).toHaveCount(0, {
      timeout: 60000,
    });
    await expect(page.locator('zylem-game canvas').first()).toBeVisible();
    await page.evaluate(() => {
      (window as any).__previousDemo = (
        document.querySelector('zylem-game') as any
      ).game;
    });
    await page.getByRole('button', { name: 'Restart example' }).click();
    await expect
      .poll(() =>
        page.evaluate(() =>
          Boolean(
            (document.querySelector('zylem-game') as any)?.game &&
              (document.querySelector('zylem-game') as any)?.game !==
                (window as any).__previousDemo,
          ),
        ),
      )
      .toBe(true);
    await expect(page.locator('[data-demo-loading-overlay]')).toHaveCount(0, {
      timeout: 60000,
    });
    expect(errors).toEqual([]);
    if (legacyIds?.length) {
      await page.goto(`/demos/${legacyIds[0]}`);
      await expect(page.locator('zylem-game')).toHaveAttribute(
        'data-demo-id',
        id,
      );
    }
  });
}

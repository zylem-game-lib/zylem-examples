import { test, expect } from '@playwright/test';

test.describe('<zylem-editor> web component', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    test.skip(
      testInfo.project.name.includes('Mobile'),
      'Desktop launcher coverage only',
    );

    await page.goto('/');
  });

  test('renders the zylem-editor element', async ({ page }) => {
    // The zylem-editor web component should be present in the DOM
    const editor = page.locator('zylem-editor');
    await expect(editor).toBeAttached();
  });

  test('renders the editor toggle button', async ({ page }) => {
    // The toggle button lives inside the shadow DOM of zylem-editor
    const editor = page.locator('zylem-editor');
    const toggleButton = editor.locator('#zylem-editor-toggle');
    
    await expect(toggleButton).toBeVisible();
    await expect(toggleButton).toHaveAttribute('type', 'button');
  });

  test('opens the editor panel when toggle button is clicked', async ({ page }) => {
    const editor = page.locator('zylem-editor');
    const toggleButton = editor.locator('#zylem-editor-toggle');
    
    // Click the toggle button to open the editor panel
    await toggleButton.click();
    
    // The panel container lists its sections; Game is the first.
    const gameSection = editor.getByText('Game');
    await expect(gameSection).toBeVisible();
  });

  test('closes the editor windows when their close buttons are clicked', async ({ page }) => {
    const editor = page.locator('zylem-editor');
    const toggleButton = editor.locator('#zylem-editor-toggle');

    await toggleButton.click();

    const gameSection = editor.getByText('Game');
    await expect(gameSection).toBeVisible();

    // Toolbar and panel container each have a close button. Closing one
    // leaves the other up, so both have to go before the editor is shut.
    const closeButtons = editor.locator('[data-testid="floating-panel-close"]');
    await expect(closeButtons).toHaveCount(2);
    await closeButtons.first().click();
    await closeButtons.first().click();

    await expect(gameSection).toHaveCount(0);
  });
});

const { test, expect } = require('@playwright/test');
const { TodoPage } = require('./pages/TodoPage');

test.describe('TODO App Workflow', () => {
  let todoPage;

  test.beforeEach(async ({ page }) => {
    todoPage = new TodoPage(page);
    await todoPage.goto();
  });

  test('page loads and displays initial tasks', async ({ page }) => {
    await expect(page.getByText('To Do App')).toBeVisible();
    await expect(page.getByText('Items from Database')).toBeVisible();
    await expect(page.getByRole('listitem')).toHaveCount(3);
  });

  test('add a new task with a due date', async ({ page }) => {
    await todoPage.addTask('E2E Task With Date', '2026-06-15');

    await expect(page.getByText('E2E Task With Date')).toBeVisible();
    await expect(page.getByText('Due: 2026-06-15')).toBeVisible();
  });

  test('add a task without a due date', async ({ page }) => {
    await todoPage.addTask('E2E Task No Date');

    await expect(page.getByText('E2E Task No Date')).toBeVisible();
    // The new item should show "No due date"
    const listItem = page.getByRole('listitem').filter({ hasText: 'E2E Task No Date' });
    await expect(listItem.getByText('No due date')).toBeVisible();
  });

  test('edit a task name and due date', async ({ page }) => {
    const initialNames = await todoPage.getTaskNames();
    const firstName = initialNames[0];

    await todoPage.editTask(firstName, 'Edited Task', '2026-12-25');

    await expect(page.getByText('Edited Task')).toBeVisible();
    await expect(page.getByText('Due: 2026-12-25')).toBeVisible();
  });

  test('delete a task', async ({ page }) => {
    const initialCount = await page.getByRole('listitem').count();
    const names = await todoPage.getTaskNames();
    const targetName = names[names.length - 1];

    await todoPage.deleteTask(targetName);

    await expect(page.getByRole('listitem')).toHaveCount(initialCount - 1);
  });

  test('tasks are sorted newest first', async ({ page }) => {
    await todoPage.addTask('Newest Task', '2026-08-01');

    // The newly added task should appear first in the list
    const firstItem = page.getByRole('listitem').first();
    await expect(firstItem).toContainText('Newest Task');
  });

  test('cannot add a task with empty name', async ({ page }) => {
    const initialCount = await page.getByRole('listitem').count();

    // Click submit without typing a name
    await page.getByRole('button', { name: 'Click me' }).click();

    // Count should remain the same
    await expect(page.getByRole('listitem')).toHaveCount(initialCount);
  });
});

// All Tests passed
class TodoPage {
  constructor(page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('/');
    await this.page.waitForSelector('text=Items from Database');
  }

  async addTask(name, dueDate = '') {
    await this.page.getByLabel('Task Name').fill(name);
    if (dueDate) {
      await this.page.getByLabel('Due Date').fill(dueDate);
    }
    await this.page.getByRole('button', { name: 'Click me' }).click();
  }

  async editTask(name, newName, newDueDate) {
    const listItem = this.page.getByRole('listitem').filter({ hasText: name });
    await listItem.getByLabel('edit').click();

    // After clicking edit, the text moves into an input — locate by value
    const nameInput = this.page.locator(`input[value="${name}"]`);
    await nameInput.fill(newName);

    if (newDueDate !== undefined) {
      // The edit date input is the last date input on the page (after the add form's)
      const dateInputs = this.page.locator('input[type="date"]');
      await dateInputs.last().fill(newDueDate);
    }

    await this.page.getByLabel('save').click();
  }

  async deleteTask(name) {
    const listItem = this.page.getByRole('listitem').filter({ hasText: name });
    await listItem.getByLabel('delete').click();
  }

  async getTaskNames() {
    const items = this.page.getByRole('listitem');
    const count = await items.count();
    const names = [];
    for (let i = 0; i < count; i++) {
      const text = await items.nth(i).innerText();
      names.push(text.split('\n')[0]);
    }
    return names;
  }

  async hasTask(name) {
    return this.page.getByText(name).isVisible();
  }
}

module.exports = { TodoPage };

const request = require('supertest');
const { app, db } = require('../../src/app');

afterAll(() => {
  if (db) {
    db.close();
  }
});

describe('TODO API Integration', () => {
  let createdItemId;

  it('should create a task with a due date', async () => {
    const response = await request(app)
      .post('/api/items')
      .send({ name: 'Integration Task', due_date: '2026-05-15' })
      .set('Accept', 'application/json');

    expect(response.status).toBe(201);
    expect(response.body.name).toBe('Integration Task');
    expect(response.body.due_date).toBe('2026-05-15');
    expect(response.body).toHaveProperty('id');
    createdItemId = response.body.id;
  });

  it('should read the created task from the list', async () => {
    const response = await request(app).get('/api/items');

    expect(response.status).toBe(200);
    const found = response.body.find(item => item.id === createdItemId);
    expect(found).toBeDefined();
    expect(found.name).toBe('Integration Task');
    expect(found.due_date).toBe('2026-05-15');
  });

  it('should update the task name and due date', async () => {
    const response = await request(app)
      .put(`/api/items/${createdItemId}`)
      .send({ name: 'Updated Integration Task', due_date: '2026-06-01' })
      .set('Accept', 'application/json');

    expect(response.status).toBe(200);
    expect(response.body.name).toBe('Updated Integration Task');
    expect(response.body.due_date).toBe('2026-06-01');
  });

  it('should delete the task', async () => {
    const response = await request(app).delete(`/api/items/${createdItemId}`);

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(createdItemId);
  });

  it('should confirm the task no longer exists', async () => {
    const response = await request(app).get('/api/items');

    expect(response.status).toBe(200);
    const found = response.body.find(item => item.id === createdItemId);
    expect(found).toBeUndefined();
  });
});

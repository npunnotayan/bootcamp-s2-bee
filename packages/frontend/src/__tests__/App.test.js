import React, { act } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import App from '../App';

// Mock server to intercept API requests
const server = setupServer(
  // GET /api/items handler
  rest.get('/api/items', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([
        { id: 1, name: 'Test Item 1', due_date: '2026-05-01', created_at: '2023-01-01T00:00:00.000Z' },
        { id: 2, name: 'Test Item 2', due_date: null, created_at: '2023-01-02T00:00:00.000Z' },
      ])
    );
  }),

  // POST /api/items handler
  rest.post('/api/items', (req, res, ctx) => {
    const { name, due_date } = req.body;

    if (!name || name.trim() === '') {
      return res(
        ctx.status(400),
        ctx.json({ error: 'Item name is required' })
      );
    }

    return res(
      ctx.status(201),
      ctx.json({
        id: 3,
        name,
        due_date: due_date || null,
        created_at: new Date().toISOString(),
      })
    );
  }),

  // PUT /api/items/:id handler
  rest.put('/api/items/:id', (req, res, ctx) => {
    const { name, due_date } = req.body;
    const { id } = req.params;

    return res(
      ctx.status(200),
      ctx.json({
        id: Number(id),
        name,
        due_date: due_date || null,
        created_at: '2023-01-01T00:00:00.000Z',
      })
    );
  }),

  // DELETE /api/items/:id handler
  rest.delete('/api/items/:id', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({ message: 'Item deleted successfully', id: Number(req.params.id) })
    );
  })
);

// Setup and teardown for the mock server
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('App Component', () => {
  test('renders the header', async () => {
    await act(async () => {
      render(<App />);
    });

    await waitFor(() => {
      expect(screen.getByText('To Do App')).toBeInTheDocument();
    });
  });

  test('loads and displays items with due dates', async () => {
    await act(async () => {
      render(<App />);
    });

    await waitFor(() => {
      expect(screen.getByText('Test Item 1')).toBeInTheDocument();
      expect(screen.getByText('Test Item 2')).toBeInTheDocument();
      expect(screen.getByText('Due: 2026-05-01')).toBeInTheDocument();
      expect(screen.getByText('No due date')).toBeInTheDocument();
    });
  });

  test('adds a new item using the Click me button', async () => {
    const user = userEvent.setup();

    await act(async () => {
      render(<App />);
    });

    await waitFor(() => {
      expect(screen.getByText('Test Item 1')).toBeInTheDocument();
    });

    const input = screen.getByLabelText('Task Name');
    await act(async () => {
      await user.type(input, 'New Test Item');
    });

    const submitButton = screen.getByText('Click me');
    await act(async () => {
      await user.click(submitButton);
    });

    await waitFor(() => {
      expect(screen.getByText('New Test Item')).toBeInTheDocument();
    });
  });

  test('edits an existing item', async () => {
    const user = userEvent.setup();

    await act(async () => {
      render(<App />);
    });

    await waitFor(() => {
      expect(screen.getByText('Test Item 1')).toBeInTheDocument();
    });

    const editButtons = screen.getAllByLabelText('edit');
    await act(async () => {
      await user.click(editButtons[0]);
    });

    const nameInput = screen.getByDisplayValue('Test Item 1');
    await act(async () => {
      await user.clear(nameInput);
      await user.type(nameInput, 'Updated Item');
    });

    const saveButton = screen.getByLabelText('save');
    await act(async () => {
      await user.click(saveButton);
    });

    await waitFor(() => {
      expect(screen.getByText('Updated Item')).toBeInTheDocument();
    });
  });

  test('handles API error', async () => {
    server.use(
      rest.get('/api/items', (req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    await act(async () => {
      render(<App />);
    });

    await waitFor(() => {
      expect(screen.getByText(/Failed to fetch data/)).toBeInTheDocument();
    });
  });

  test('shows empty state when no items', async () => {
    server.use(
      rest.get('/api/items', (req, res, ctx) => {
        return res(ctx.status(200), ctx.json([]));
      })
    );

    await act(async () => {
      render(<App />);
    });

    await waitFor(() => {
      expect(screen.getByText('No items found. Add some!')).toBeInTheDocument();
    });
  });
});
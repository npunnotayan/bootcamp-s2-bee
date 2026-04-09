import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Box,
  Paper,
  Alert,
  CircularProgress,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import './App.css';

function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newItem, setNewItem] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editDueDate, setEditDueDate] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/items');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const result = await response.json();
      setData(result);
      setError(null);
    } catch (err) {
      setError('Failed to fetch data: ' + err.message);
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newItem.trim()) return;

    try {
      const response = await fetch('/api/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newItem, due_date: newDueDate || null }),
      });

      if (!response.ok) {
        throw new Error('Failed to add item');
      }

      const result = await response.json();
      setData([result, ...data]);
      setNewItem('');
      setNewDueDate('');
    } catch (err) {
      setError('Error adding item: ' + err.message);
      console.error('Error adding item:', err);
    }
  };

  const handleDelete = async (itemId) => {
    try {
      const response = await fetch(`/api/items/${itemId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete item');
      }

      setData(data.filter(item => item.id !== itemId));
      setError(null);
    } catch (err) {
      setError('Error deleting item: ' + err.message);
      console.error('Error deleting item:', err);
    }
  };

  const handleEditStart = (item) => {
    setEditingId(item.id);
    setEditName(item.name);
    setEditDueDate(item.due_date || '');
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditName('');
    setEditDueDate('');
  };

  const handleEditSave = async (itemId) => {
    if (!editName.trim()) return;

    try {
      const response = await fetch(`/api/items/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: editName, due_date: editDueDate || null }),
      });

      if (!response.ok) {
        throw new Error('Failed to update item');
      }

      const updatedItem = await response.json();
      setData(data.map(item => item.id === itemId ? updatedItem : item));
      setEditingId(null);
      setEditName('');
      setEditDueDate('');
    } catch (err) {
      setError('Error updating item: ' + err.message);
      console.error('Error updating item:', err);
    }
  };

  return (
    <Box>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            To Do App
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Add New Item
          </Typography>
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              placeholder="Enter item name"
              label="Task Name"
              size="small"
              sx={{ flex: 1 }}
            />
            <TextField
              type="date"
              value={newDueDate}
              onChange={(e) => setNewDueDate(e.target.value)}
              label="Due Date"
              size="small"
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                type="submit"
                variant="contained"
                sx={{ backgroundColor: '#4caf50', color: '#fff', '&:hover': { backgroundColor: '#388e3c' } }}
              >
                Click me
              </Button>
            </Box>
          </Box>
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Items from Database
          </Typography>
          {loading && <CircularProgress />}
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {!loading && !error && (
            <List>
              {data.length > 0 ? (
                data.map((item) => (
                  <ListItem
                    key={item.id}
                    divider
                    secondaryAction={
                      editingId === item.id ? (
                        <>
                          <IconButton aria-label="save" onClick={() => handleEditSave(item.id)}>
                            <SaveIcon />
                          </IconButton>
                          <IconButton aria-label="cancel" onClick={handleEditCancel}>
                            <CancelIcon />
                          </IconButton>
                        </>
                      ) : (
                        <>
                          <IconButton aria-label="edit" onClick={() => handleEditStart(item)}>
                            <EditIcon />
                          </IconButton>
                          <IconButton aria-label="delete" onClick={() => handleDelete(item.id)}>
                            <DeleteIcon />
                          </IconButton>
                        </>
                      )
                    }
                  >
                    {editingId === item.id ? (
                      <Box sx={{ display: 'flex', gap: 2, flex: 1, mr: 2 }}>
                        <TextField
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          size="small"
                          label="Task Name"
                          sx={{ flex: 1 }}
                        />
                        <TextField
                          type="date"
                          value={editDueDate}
                          onChange={(e) => setEditDueDate(e.target.value)}
                          size="small"
                          label="Due Date"
                          slotProps={{ inputLabel: { shrink: true } }}
                        />
                      </Box>
                    ) : (
                      <ListItemText
                        primary={item.name}
                        secondary={item.due_date ? `Due: ${item.due_date}` : 'No due date'}
                      />
                    )}
                  </ListItem>
                ))
              ) : (
                <Typography color="text.secondary">No items found. Add some!</Typography>
              )}
            </List>
          )}
        </Paper>
      </Container>
    </Box>
  );
}

export default App;
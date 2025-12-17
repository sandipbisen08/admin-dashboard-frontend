import React, { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  TextField,
  Typography,
} from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { aboutDetailsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

const emptyForm = {
  imageFile: null,
  title: '',
  description: '',
};

const AboutDetailsPage = () => {
  const qc = useQueryClient();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');

  const backendBaseUrl = useMemo(() => {
    const apiBase = process.env.REACT_APP_API_URL || 'https://admin-dashboard-backend-blush.vercel.app/api';
    return apiBase.replace(/\/?api\/?$/, '');
  }, []);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['about-details'],
    queryFn: async () => {
      const res = await aboutDetailsApi.list();
      return res.data;
    },
  });

  const items = useMemo(() => data || [], [data]);

  const createMutation = useMutation({
    mutationFn: async (payload) => (await aboutDetailsApi.create(payload)).data,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['about-details'] });
      handleCloseDialog();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }) => (await aboutDetailsApi.update(id, payload)).data,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['about-details'] });
      handleCloseDialog();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => (await aboutDetailsApi.remove(id)).data,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['about-details'] });
    },
  });

  const handleOpenCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormError('');
    setDialogOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingId(item.id);
    setForm({
      imageFile: null,
      title: item.title || '',
      description: item.description || '',
    });
    setFormError('');
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingId(null);
    setForm(emptyForm);
    setFormError('');
  };

  const validate = () => {
    if (!editingId && !form.imageFile) return 'Image file is required';
    if (!form.title.trim()) return 'Title is required';
    if (!form.description.trim()) return 'Description is required';
    return '';
  };

  const handleSave = async () => {
    const msg = validate();
    if (msg) {
      setFormError(msg);
      return;
    }

    setFormError('');

    const fd = new FormData();
    fd.append('title', form.title.trim());
    fd.append('description', form.description.trim());
    if (form.imageFile) {
      fd.append('image', form.imageFile);
    }

    if (editingId) {
      await updateMutation.mutateAsync({ id: editingId, payload: fd });
    } else {
      await createMutation.mutateAsync(fd);
    }
  };

  const handleDelete = async (id) => {
    const ok = window.confirm('Delete this about detail?');
    if (!ok) return;
    await deleteMutation.mutateAsync(id);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">About Details</Typography>
        <Button variant="contained" onClick={handleOpenCreate} disabled={!isAdmin}>
          Add
        </Button>
      </Box>

      {!isAdmin && (
        <Alert severity="info" sx={{ mb: 2 }}>
          You can view about details. Only admins can add/edit/delete.
        </Alert>
      )}

      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      )}

      {isError && (
        <Alert severity="error">
          {error?.response?.data?.message || error?.message || 'Failed to load about details'}
        </Alert>
      )}

      {!isLoading && !isError && items.length === 0 && (
        <Alert severity="warning">No about details found. Click Add to create one.</Alert>
      )}

      <Grid container spacing={2}>
        {items.map((item) => (
          <Grid key={item.id} item xs={12} md={6} lg={4}>
            <Card>
              <CardMedia
                component="img"
                height="160"
                image={`${backendBaseUrl}${item.imagePath}`}
                alt={item.title}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {item.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
                  {item.description}
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: 'flex-end' }}>
                <Button size="small" onClick={() => handleOpenEdit(item)} disabled={!isAdmin}>
                  Edit
                </Button>
                <Button
                  size="small"
                  color="error"
                  onClick={() => handleDelete(item.id)}
                  disabled={!isAdmin || deleteMutation.isPending}
                >
                  Delete
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <DialogTitle>{editingId ? 'Edit About Detail' : 'Add About Detail'}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}
          <Box sx={{ mt: 1, mb: 1 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              {editingId ? 'Change Image (optional)' : 'Upload Image'}
            </Typography>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files && e.target.files[0] ? e.target.files[0] : null;
                setForm((p) => ({ ...p, imageFile: file }));
              }}
            />
            {form.imageFile && (
              <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                Selected: {form.imageFile.name}
              </Typography>
            )}
          </Box>
          <TextField
            label="Title"
            value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Description"
            value={form.description}
            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            fullWidth
            margin="normal"
            multiline
            minRows={4}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={!isAdmin || createMutation.isPending || updateMutation.isPending}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AboutDetailsPage;

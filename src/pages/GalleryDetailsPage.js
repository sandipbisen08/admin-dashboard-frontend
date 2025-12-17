import React, { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  ImageList,
  ImageListItem,
  TextField,
  Typography,
} from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { galleryDetailsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

const emptyForm = {
  imageFiles: [],
  title: '',
  description: '',
};

const GalleryDetailsPage = () => {
  const qc = useQueryClient();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');

  const backendBaseUrl = useMemo(() => {
    const apiBase = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    return apiBase.replace(/\/?api\/?$/, '');
  }, []);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['gallery-details'],
    queryFn: async () => {
      const res = await galleryDetailsApi.list();
      return res.data;
    },
  });

  const items = useMemo(() => data || [], [data]);

  const createMutation = useMutation({
    mutationFn: async (payload) => (await galleryDetailsApi.create(payload)).data,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['gallery-details'] });
      handleCloseDialog();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }) => (await galleryDetailsApi.update(id, payload)).data,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['gallery-details'] });
      handleCloseDialog();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => (await galleryDetailsApi.remove(id)).data,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['gallery-details'] });
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
      imageFiles: [],
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
    if (!editingId && (!form.imageFiles || form.imageFiles.length === 0)) return 'Select at least one image';
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
    for (const file of form.imageFiles) {
      fd.append('images', file);
    }

    if (editingId) {
      await updateMutation.mutateAsync({ id: editingId, payload: fd });
    } else {
      await createMutation.mutateAsync(fd);
    }
  };

  const handleDelete = async (id) => {
    const ok = window.confirm('Delete this gallery entry?');
    if (!ok) return;
    await deleteMutation.mutateAsync(id);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">Gallery Details</Typography>
        <Button variant="contained" onClick={handleOpenCreate} disabled={!isAdmin}>
          Add
        </Button>
      </Box>

      {!isAdmin && (
        <Alert severity="info" sx={{ mb: 2 }}>
          You can view gallery details. Only admins can add/edit/delete.
        </Alert>
      )}

      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      )}

      {isError && (
        <Alert severity="error">
          {error?.response?.data?.message || error?.message || 'Failed to load gallery details'}
        </Alert>
      )}

      {!isLoading && !isError && items.length === 0 && (
        <Alert severity="warning">No gallery entries found. Click Add to create one.</Alert>
      )}

      <Grid container spacing={2}>
        {items.map((item) => (
          <Grid key={item.id} item xs={12} md={6} lg={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {item.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap', mb: 1 }}>
                  {item.description}
                </Typography>

                <ImageList cols={3} gap={6} sx={{ mt: 0.5 }}>
                  {(item.imagePaths || []).slice(0, 6).map((p) => (
                    <ImageListItem key={p}>
                      <img
                        src={`${backendBaseUrl}${p}`}
                        alt={item.title}
                        loading="lazy"
                        style={{ width: '100%', height: 80, objectFit: 'cover', borderRadius: 4 }}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </ImageListItem>
                  ))}
                </ImageList>
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
        <DialogTitle>{editingId ? 'Edit Gallery Entry' : 'Add Gallery Entry'}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}

          <Box sx={{ mt: 1, mb: 1 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              {editingId ? 'Replace Images (optional)' : 'Upload Images'}
            </Typography>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => {
                const files = e.target.files ? Array.from(e.target.files) : [];
                setForm((p) => ({ ...p, imageFiles: files }));
              }}
            />
            {form.imageFiles.length > 0 && (
              <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                Selected: {form.imageFiles.length} file(s)
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

export default GalleryDetailsPage;

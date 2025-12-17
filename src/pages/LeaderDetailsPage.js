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
  Divider,
  Grid,
  TextField,
  Typography,
} from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { leaderDetailsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

const roles = [
  { key: 'sarpanch', label: 'Sarpanch Details' },
  { key: 'upsarpanch', label: 'Upsarpanch Details' },
  { key: 'gramsevak', label: 'Gramsevak Details' },
];

const emptyForm = {
  imageFile: null,
  name: '',
  description: '',
  phone: '',
  email: '',
};

const LeaderSection = ({
  roleKey,
  roleLabel,
  data,
  isAdmin,
  backendBaseUrl,
  onEdit,
  onDelete,
}) => {
  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="h5">{roleLabel}</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="contained" onClick={() => onEdit(roleKey, data)} disabled={!isAdmin}>
            {data ? 'Edit' : 'Add'}
          </Button>
          <Button
            variant="outlined"
            color="error"
            onClick={() => onDelete(roleKey)}
            disabled={!isAdmin || !data}
          >
            Delete
          </Button>
        </Box>
      </Box>

      {!data ? (
        <Alert severity="warning">No data saved for {roleLabel}. Click Add to create.</Alert>
      ) : (
        <Card>
          <CardMedia
            component="img"
            height="180"
            image={`${backendBaseUrl}${data.imagePath}`}
            alt={data.name}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {data.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap', mb: 1 }}>
              {data.description}
            </Typography>
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              <strong>Phone:</strong> {data.phone}
            </Typography>
            <Typography variant="body2">
              <strong>Email:</strong> {data.email}
            </Typography>
          </CardContent>
          <CardActions />
        </Card>
      )}
    </Box>
  );
};

const LeaderDetailsPage = () => {
  const qc = useQueryClient();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const backendBaseUrl = useMemo(() => {
    const apiBase = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    return apiBase.replace(/\/?api\/?$/, '');
  }, []);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeRole, setActiveRole] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');

  const queries = roles.map((r) =>
    useQuery({
      queryKey: ['leader-details', r.key],
      queryFn: async () => (await leaderDetailsApi.getByRole(r.key)).data,
    })
  );

  const anyLoading = queries.some((q) => q.isLoading);
  const anyError = queries.find((q) => q.isError);

  const leaderDataByRole = useMemo(() => {
    const out = {};
    roles.forEach((r, idx) => {
      out[r.key] = queries[idx].data || null;
    });
    return out;
  }, [queries.map((q) => q.data).join('|')]);

  const upsertMutation = useMutation({
    mutationFn: async ({ role, payload }) => (await leaderDetailsApi.upsertByRole(role, payload)).data,
    onSuccess: async (_data, vars) => {
      await qc.invalidateQueries({ queryKey: ['leader-details', vars.role] });
      handleCloseDialog();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (role) => (await leaderDetailsApi.removeByRole(role)).data,
    onSuccess: async (_data, role) => {
      await qc.invalidateQueries({ queryKey: ['leader-details', role] });
    },
  });

  const handleOpenDialog = (role, existing) => {
    setActiveRole(role);
    setFormError('');
    setForm({
      imageFile: null,
      name: existing?.name || '',
      description: existing?.description || '',
      phone: existing?.phone || '',
      email: existing?.email || '',
    });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setActiveRole(null);
    setForm(emptyForm);
    setFormError('');
  };

  const validate = () => {
    const existing = activeRole ? leaderDataByRole[activeRole] : null;
    if (!existing && !form.imageFile) return 'Image file is required';
    if (!form.name.trim()) return 'Name is required';
    if (!form.description.trim()) return 'Description is required';
    if (!form.phone.trim()) return 'Phone number is required';
    if (!form.email.trim()) return 'Email is required';
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
    fd.append('name', form.name.trim());
    fd.append('description', form.description.trim());
    fd.append('phone', form.phone.trim());
    fd.append('email', form.email.trim());
    if (form.imageFile) fd.append('image', form.imageFile);

    await upsertMutation.mutateAsync({ role: activeRole, payload: fd });
  };

  const handleDelete = async (role) => {
    const ok = window.confirm('Delete this leader details section?');
    if (!ok) return;
    await deleteMutation.mutateAsync(role);
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Leader Details
      </Typography>

      {!isAdmin && (
        <Alert severity="info" sx={{ mb: 2 }}>
          You can view leader details. Only admins can add/edit/delete.
        </Alert>
      )}

      {anyLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      )}

      {anyError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {anyError.error?.response?.data?.message || anyError.error?.message || 'Failed to load leader details'}
        </Alert>
      )}

      {!anyLoading && !anyError && (
        <Grid container spacing={2}>
          <Grid item xs={12}>
            {roles.map((r, idx) => (
              <Box key={r.key}>
                <LeaderSection
                  roleKey={r.key}
                  roleLabel={r.label}
                  data={leaderDataByRole[r.key]}
                  isAdmin={isAdmin}
                  backendBaseUrl={backendBaseUrl}
                  onEdit={handleOpenDialog}
                  onDelete={handleDelete}
                />
                {idx !== roles.length - 1 && <Divider sx={{ my: 3 }} />}
              </Box>
            ))}
          </Grid>
        </Grid>
      )}

      <Dialog open={dialogOpen} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <DialogTitle>
          {activeRole ? roles.find((r) => r.key === activeRole)?.label : 'Leader Details'}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}
          <Box sx={{ mt: 1, mb: 1 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Upload Image (optional on edit)
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
            label="Name"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
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
          <TextField
            label="Phone Number"
            value={form.phone}
            onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Email"
            value={form.email}
            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
            fullWidth
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={!isAdmin || upsertMutation.isPending}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LeaderDetailsPage;

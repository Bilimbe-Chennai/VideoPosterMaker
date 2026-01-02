import React, { useState, useEffect } from 'react';
import {
    Container,
    Paper,
    TextField,
    Button,
    Typography,
    Box,
    Alert,
    Grid,
    MenuItem,
    Select,
    InputLabel,
    FormControl,
    Chip,
    OutlinedInput,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import useAxios from "../useAxios";

const accessOptions = [
    'photomerge',
    'videovideo',
    'videovideovideo'
];

const UserForm = () => {
    const axiosData = useAxios();
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        branchName: '',
        type: 'client',
        status: 'active',
        accessType: [],
        templateCount: 1,
    });

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isEditMode) {
            fetchUser();
        }
    }, [id]);

    const fetchUser = async () => {
        try {
            const response = await axiosData.get(`/users/${id}`);
            const userData = response.data.data;
            setFormData({
                ...userData,
                password: '', // Don't populate password
                confirmPassword: '',
                accessType: userData.accessType || [],
            });
        } catch (err) {
            setError('Failed to load user data');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleAccessChange = (event) => {
        const {
            target: { value },
        } = event;
        setFormData({
            ...formData,
            accessType: typeof value === 'string' ? value.split(',') : value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!isEditMode && formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (!isEditMode && formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            const payload = { ...formData };
            delete payload.confirmPassword;
            if (isEditMode && !payload.password) {
                delete payload.password; // Don't update password if empty in edit mode
            }

            if (isEditMode) {
                await axiosData.put(`/users/${id}`, payload);
                setSuccess('User updated successfully!');
            } else {
                await axiosData.post('/users', payload);
                setSuccess('User created successfully!');
            }

            setTimeout(() => {
                navigate('/admin/users');
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to save user');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="md">
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate('/admin/users')}
                    sx={{ mr: 2 }}
                >
                    Back
                </Button>
                <Typography variant="h4" component="h1">
                    {isEditMode ? 'Edit User' : 'Create New User'}
                </Typography>
            </Box>

            <Paper sx={{ p: 4 }}>
                {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                )}

                {success && (
                    <Alert severity="success" sx={{ mb: 3 }}>
                        {success}
                    </Alert>
                )}

                <form onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <TextField
                                required
                                fullWidth
                                label="Full Name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                required
                                fullWidth
                                label="Email Address"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                disabled={isEditMode}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                required={!isEditMode}
                                fullWidth
                                label={isEditMode ? "New Password (leave blank to keep current)" : "Password"}
                                name="password"
                                type="password"
                                value={formData.password}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                required={!isEditMode && formData.password}
                                fullWidth
                                label="Confirm Password"
                                name="confirmPassword"
                                type="password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Branch Name"
                                name="branchName"
                                value={formData.branchName}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel>User Type</InputLabel>
                                <Select
                                    name="type"
                                    value={formData.type}
                                    onChange={handleChange}
                                    label="User Type"
                                >
                                    <MenuItem value="admin">Admin</MenuItem>
                                    <MenuItem value="sub-admin">Sub-Admin</MenuItem>
                                    <MenuItem value="client">Client</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel>Status</InputLabel>
                                <Select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    label="Status"
                                >
                                    <MenuItem value="active">Active</MenuItem>
                                    <MenuItem value="inactive">Inactive</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Template Count"
                                name="templateCount"
                                type="number"
                                value={formData.templateCount}
                                onChange={handleChange}
                                InputProps={{ inputProps: { min: 1 } }}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel id="access-type-label">Access Types</InputLabel>
                                <Select
                                    labelId="access-type-label"
                                    multiple
                                    value={formData.accessType}
                                    onChange={handleAccessChange}
                                    input={<OutlinedInput label="Access Types" />}
                                    renderValue={(selected) => (
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                            {selected.map((value) => (
                                                <Chip key={value} label={value} size="small" />
                                            ))}
                                        </Box>
                                    )}
                                >
                                    {accessOptions.map((option) => (
                                        <MenuItem key={option} value={option}>
                                            {option}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
                        <Button
                            variant="outlined"
                            onClick={() => navigate('/admin/users')}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : (isEditMode ? 'Update User' : 'Create User')}
                        </Button>
                    </Box>
                </form>
            </Paper>
        </Container>
    );
};

export default UserForm;

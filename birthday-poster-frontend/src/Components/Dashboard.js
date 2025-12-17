import React, { useState, useEffect } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  LinearProgress,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import PeopleIcon from '@mui/icons-material/People';
import DescriptionIcon from '@mui/icons-material/Description';
import UploadIcon from '@mui/icons-material/Upload';
import BarChartIcon from '@mui/icons-material/BarChart';
import CalendarView from '../components/Calendar/CalendarView';
import StatisticsChart from '../components/Charts/StatisticsChart';
import useAxios from "../useAxios";

const Dashboard = () => {
   const axiosData = useAxios();
  const [stats, setStats] = useState({
    totalAdmins: 0,
    totalUsers: 0,
    totalTemplates: 0,
    uploadsToday: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // In a real app, you'd have a dedicated dashboard endpoint
      const [adminsRes, usersRes, templatesRes] = await Promise.all([
        axiosData.get('/admins'),
        axiosData.get('/users'),
        axiosData.get('/templates'),
      ]);

      setStats({
        totalAdmins: adminsRes.data.length,
        totalUsers: usersRes.data.length,
        totalTemplates: templatesRes.data.length,
        uploadsToday: Math.floor(Math.random() * 50), // Mock data
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Admins',
      value: stats.totalAdmins,
      icon: <PeopleIcon sx={{ fontSize: 40 }} />,
      color: '#1976d2',
    },
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: <PeopleIcon sx={{ fontSize: 40 }} />,
      color: '#388e3c',
    },
    {
      title: 'Templates',
      value: stats.totalTemplates,
      icon: <DescriptionIcon sx={{ fontSize: 40 }} />,
      color: '#d32f2f',
    },
    {
      title: 'Uploads Today',
      value: stats.uploadsToday,
      icon: <UploadIcon sx={{ fontSize: 40 }} />,
      color: '#f57c00',
    },
  ];

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Dashboard
        </Typography>
        <IconButton onClick={fetchDashboardData}>
          <RefreshIcon />
        </IconButton>
      </Box>

      {loading ? (
        <LinearProgress />
      ) : (
        <>
          {/* Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {statCards.map((card, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography color="textSecondary" gutterBottom>
                          {card.title}
                        </Typography>
                        <Typography variant="h4" component="div">
                          {card.value}
                        </Typography>
                      </Box>
                      <Box sx={{ color: card.color }}>
                        {card.icon}
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Charts and Calendar */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Statistics
                </Typography>
                <StatisticsChart />
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Calendar
                </Typography>
                <CalendarView />
              </Paper>
            </Grid>
          </Grid>

          {/* Recent Activity */}
          <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <CardHeader
                  title="Recent Activity"
                  action={
                    <IconButton>
                      <BarChartIcon />
                    </IconButton>
                  }
                />
                <CardContent>
                  <Typography variant="body2" color="text.secondary">
                    • New admin "John Doe" was created<br />
                    • Template "Basic Form" was updated<br />
                    • 25 new users uploaded photos<br />
                    • Weekly report generated<br />
                    • System backup completed
                  </Typography>
                </CardContent>
              </Paper>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
};

export default Dashboard;
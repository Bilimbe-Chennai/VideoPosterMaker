import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { Paper, Typography, Box, ToggleButton, ToggleButtonGroup } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { useState } from 'react';

const StatisticsChart = () => {
  const [chartType, setChartType] = useState('line');

  const data = [
    { name: 'Jan', users: 400, admins: 24, templates: 10 },
    { name: 'Feb', users: 300, admins: 28, templates: 15 },
    { name: 'Mar', users: 200, admins: 32, templates: 20 },
    { name: 'Apr', users: 278, admins: 35, templates: 25 },
    { name: 'May', users: 189, admins: 38, templates: 30 },
    { name: 'Jun', users: 239, admins: 40, templates: 35 },
    { name: 'Jul', users: 349, admins: 42, templates: 40 },
    { name: 'Aug', users: 400, admins: 45, templates: 45 },
    { name: 'Sep', users: 480, admins: 48, templates: 50 },
    { name: 'Oct', users: 550, admins: 50, templates: 55 },
    { name: 'Nov', users: 600, admins: 52, templates: 60 },
    { name: 'Dec', users: 700, admins: 55, templates: 65 },
  ];

  const handleChartTypeChange = (event, newType) => {
    if (newType !== null) {
      setChartType(newType);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Growth Statistics</Typography>
        <ToggleButtonGroup
          value={chartType}
          exclusive
          onChange={handleChartTypeChange}
          size="small"
        >
          <ToggleButton value="line">Line</ToggleButton>
          <ToggleButton value="bar">Bar</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Box sx={{ height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'line' ? (
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="users" stroke="#1976d2" activeDot={{ r: 8 }} />
              <Line type="monotone" dataKey="admins" stroke="#dc004e" />
              <Line type="monotone" dataKey="templates" stroke="#388e3c" />
            </LineChart>
          ) : (
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="users" fill="#1976d2" />
              <Bar dataKey="admins" fill="#dc004e" />
              <Bar dataKey="templates" fill="#388e3c" />
            </BarChart>
          )}
        </ResponsiveContainer>
      </Box>

      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
        <Box>
          <Typography variant="h5" color="primary">
            700
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Total Users
          </Typography>
        </Box>
        <Box>
          <Typography variant="h5" color="secondary">
            55
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Total Admins
          </Typography>
        </Box>
        <Box>
          <Typography variant="h5" color="success.main">
            65
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Templates
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default StatisticsChart;
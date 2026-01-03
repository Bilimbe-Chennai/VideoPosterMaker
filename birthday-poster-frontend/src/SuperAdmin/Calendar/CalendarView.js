import React, { useState } from 'react';
import {
  Paper,
  Typography,
  Box,
  IconButton,
  Grid,
  Chip,
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import TodayIcon from '@mui/icons-material/Today';

const CalendarView = () => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const firstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const days = daysInMonth(year, month);
  const firstDay = firstDayOfMonth(year, month);

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getEventsForDay = (day) => {
    // Mock events - in real app, fetch from API
    const events = [];
    if (day === 1) events.push({ title: 'Meeting', color: 'primary' });
    if (day === 5) events.push({ title: 'Report Due', color: 'error' });
    if (day === 15) events.push({ title: 'Team Event', color: 'success' });
    if (day === 25) events.push({ title: 'Review', color: 'warning' });
    return events;
  };

  const renderDays = () => {
    const cells = [];
    
    // Empty cells for days before first day of month
    for (let i = 0; i < firstDay; i++) {
      cells.push(
        <Grid item xs key={`empty-${i}`}>
          <Box sx={{ height: 80, p: 1 }}></Box>
        </Grid>
      );
    }

    // Days of the month
    for (let day = 1; day <= days; day++) {
      const isToday = 
        day === new Date().getDate() && 
        month === new Date().getMonth() && 
        year === new Date().getFullYear();
      
      const events = getEventsForDay(day);

      cells.push(
        <Grid item xs key={day}>
          <Box
            sx={{
              height: 80,
              p: 1,
              border: '1px solid',
              borderColor: 'grey.200',
              borderRadius: 1,
              bgcolor: isToday ? 'primary.light' : 'background.paper',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <Typography
              variant="caption"
              sx={{
                position: 'absolute',
                top: 4,
                right: 4,
                fontWeight: isToday ? 'bold' : 'normal',
                color: isToday ? 'primary.contrastText' : 'text.secondary',
              }}
            >
              {day}
            </Typography>
            
            <Box sx={{ mt: 2 }}>
              {events.slice(0, 2).map((event, index) => (
                <Chip
                  key={index}
                  label={event.title}
                  size="small"
                  color={event.color}
                  sx={{ height: 16, fontSize: '0.6rem', mb: 0.5 }}
                />
              ))}
              {events.length > 2 && (
                <Typography variant="caption" color="text.secondary">
                  +{events.length - 2} more
                </Typography>
              )}
            </Box>
          </Box>
        </Grid>
      );
    }

    return cells;
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          {monthNames[month]} {year}
        </Typography>
        <Box>
          <IconButton size="small" onClick={prevMonth}>
            <ChevronLeftIcon />
          </IconButton>
          <IconButton size="small" onClick={goToToday}>
            <TodayIcon />
          </IconButton>
          <IconButton size="small" onClick={nextMonth}>
            <ChevronRightIcon />
          </IconButton>
        </Box>
      </Box>

      <Grid container spacing={1}>
        {/* Day headers */}
        {dayNames.map((day) => (
          <Grid item xs key={day}>
            <Typography variant="caption" align="center" display="block" fontWeight="bold">
              {day}
            </Typography>
          </Grid>
        ))}
        
        {/* Calendar days */}
        {renderDays()}
      </Grid>

      <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'grey.200' }}>
        <Typography variant="subtitle2" gutterBottom>
          Legend:
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip label="Meeting" size="small" color="primary" />
          <Chip label="Deadline" size="small" color="error" />
          <Chip label="Event" size="small" color="success" />
          <Chip label="Reminder" size="small" color="warning" />
        </Box>
      </Box>
    </Paper>
  );
};

export default CalendarView;
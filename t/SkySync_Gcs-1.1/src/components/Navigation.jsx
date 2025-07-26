import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AssessmentIcon from '@mui/icons-material/Assessment';
import InfoIcon from '@mui/icons-material/Info';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import HistoryIcon from '@mui/icons-material/History';

const Navigation = () => {
  return (
    <AppBar position="static">
      <Toolbar>

        {/* Left section: Title + Dashboard */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="h6" component="div" sx={{ mr: 2 }}>
            DroneSync GCS
          </Typography>
          <Button
            color="inherit"
            component={RouterLink}
            to="/"
            startIcon={<DashboardIcon />}
          >
            Dashboard
          </Button>
        </Box>

        {/* Center section: Status, About, Docs */}
        <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center' }}>
          <Button
            color="inherit"
            component={RouterLink}
            to="/status"
            startIcon={<AssessmentIcon />}
          >
            System Status
          </Button>
          <Button
            color="inherit"
            component={RouterLink}
            to="/about"
            startIcon={<InfoIcon />}
          >
            About
          </Button>
          <Button
            color="inherit"
            component={RouterLink}
            to="/docs"
            startIcon={<MenuBookIcon />}
          >
            Documentation
          </Button>
        </Box>

        {/* Right section: Analysis */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Button
            color="inherit"
            component={RouterLink}
            to="/analysis"
            startIcon={<HistoryIcon />}
          >
            Analysis
          </Button>
        </Box>

      </Toolbar>
    </AppBar>
  );
};

export default Navigation;

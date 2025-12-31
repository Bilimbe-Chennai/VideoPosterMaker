// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import routes from './routes';
import PremiumAdminApp from './PremiumAdmin/App';

function App() {
  return (
    <Router>
      <CssBaseline />
      <Routes>
        {routes.map((route, index) => (
          <Route
            key={index}
            path={route.path}
            element={route.element}
            exact={route.exact}
          />
        ))}
        {/* New Varamahalakshmi Silks Admin Panel */}
        <Route path="/admin-v2/*" element={<PremiumAdminApp />} />
      </Routes>
    </Router>
  );
}

export default App;
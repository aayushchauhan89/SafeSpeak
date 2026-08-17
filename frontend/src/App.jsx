import React, { useState } from 'react';
import Auth from './Auth';
import Dashboard from './Dashboard';

function App() {
  const [authenticated, setAuthenticated] = useState(!!localStorage.getItem('token'));

  const handleLogout = () => {
    localStorage.removeItem('token');
    setAuthenticated(false);
    window.history.pushState({}, '', '/');
  };

  if (!authenticated) {
    return <Auth setAuthenticated={setAuthenticated} />;
  }

  return <Dashboard handleLogout={handleLogout} />;
}

export default App;
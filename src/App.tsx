<<<<<<< HEAD
import React from 'react';
=======
>>>>>>> quentin
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { Auth } from './pages/Auth';
import { Layout } from './components/Layout';
import { AuthProvider } from './contexts/AuthContext';
<<<<<<< HEAD
=======
import Conditions from "./pages/Cgu";
import { Profile } from './pages/Profile';



>>>>>>> quentin

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
<<<<<<< HEAD
          <Route path="/auth" element={<Auth />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
=======
        <Route path="/Cgu" element={< Conditions />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="profile" element={<Profile />} />
>>>>>>> quentin
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
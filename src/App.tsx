import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { Auth } from './pages/Auth';
import { Layout } from './components/Layout';
import { AuthProvider } from './contexts/AuthContext';
import Conditions from "./pages/Cgu";
import { Profile } from './pages/Profile';




function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
        <Route path="/Cgu" element={< Conditions />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="profile" element={<Profile />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
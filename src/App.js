import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import SideNav from './SideNav/SideNav';
import Clientes from './Clientes/Clientes';
import Principal from './Principal/Principal';
import PorCobrar from './PorCobrar/PorCobrar';
import PorPagar from './PorPagar/PorPagar';
import Login from './Login/Login';
import PrivateLayout from './PrivateLayout';
import './App.css';

function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}

function App() {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  return (
    <div className={isLoginPage ? 'login-layout' : 'App'}>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/"
          element={
            <PrivateLayout>
              <Navigate to="/login" replace />
            </PrivateLayout>
          }
        />
        <Route
          path="/clientes"
          element={
            <PrivateLayout>
              <Clientes />
            </PrivateLayout>
          }
        />
        <Route
          path="/principal"
          element={
            <PrivateLayout>
              <Principal />
            </PrivateLayout>
          }
        />
        <Route
          path="/porcobrar"
          element={
            <PrivateLayout>
              <PorCobrar />
            </PrivateLayout>
          }
        />
        <Route
          path="/porpagar"
          element={
            <PrivateLayout>
              <PorPagar />
            </PrivateLayout>
          }
        />
      </Routes>
    </div>
  );
}

export default AppWrapper;

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import logo from './logo.svg';
import SideNav from './SideNav/SideNav';
import Clientes from './Clientes/Clientes';
import Principal from './Principal/Principal';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <SideNav />
        <div className="content">
          <Routes>
            <Route path="/clientes" element={<Clientes />} />
            <Route path="/principal" element={<Principal />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;

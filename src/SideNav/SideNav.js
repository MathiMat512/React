import React, { useState } from 'react';
import logo from '../images/logo.png';
import {Link} from 'react-router-dom';
import './SideNav.css';

function SideNav() {
  const [collapsed, setCollapsed] = useState(true);

  const toggleMenu = () => {
    setCollapsed(!collapsed);
  };

  return (
    <div className={`side-nav ${collapsed ? 'collapsed' : ''}`}>
      <div className="padding">
        <div className="nav-header">
          <div className="nav-item" onClick={toggleMenu}>
            <i className="fas fa-bars menu-icon" style={{ fontSize: '17px', cursor: 'pointer' }}></i>
            <span class="menu-text"></span>
          </div>
          <img src={logo} className="menu-title" style={{width:'30px',height:'30px',margin:'0'}} />
          <h3 className="menu-title" style={{ fontSize: '24px' }}>Lancaster</h3>
        </div>

        <div className="asd">
        <div className="nav-item"><Link to="/principal"><i className="fa-solid fa-house"></i><span className="menu-text">Principal</span></Link></div>
          <div className="nav-item"><Link to="/clientes"><i className="fa-solid fa-users"></i><span className="menu-text">Clientes</span></Link></div>
          <div className="nav-item"><a href="#"><i className="fa-solid fa-hand-holding-dollar"></i><span className="menu-text">Por Cobrar</span></a></div>
          <div className="nav-item"><a href="#"><i className="fa-solid fa-money-check-dollar"></i><span className="menu-text">Por Pagar</span></a></div>
          <div className="nav-item"><a href="#"><i className="fas fa-calendar-alt"></i><span className="menu-text">Events</span></a></div>
          <div className="nav-item"><a href="#"><i className="fas fa-info-circle"></i><span className="menu-text">About</span></a></div>
          <div className="nav-item"><a href="#"><i className="fas fa-cogs"></i><span className="menu-text">Services</span></a></div>
          <div className="nav-item"><a href="#"><i className="fas fa-envelope"></i><span className="menu-text">Contact</span></a></div>
        </div>
      </div>

      <div className="logout">
        <a href="#"><i className="fas fa-sign-out-alt"></i><span className="menu-text">Cerrar Sesión</span></a>
      </div>
    </div>
  );
}
export default SideNav;

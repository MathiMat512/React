import React, { useState, useEffect, useRef } from 'react';
import logo from '../images/logo.png';
import {Link} from 'react-router-dom';
import './SideNav.css';

function SideNav() {
  const [collapsed, setCollapsed] = useState(true);
  const menuIconRef = useRef(null);
  const sideNavRef = useRef(null);
  const mediaQuery = window.matchMedia("(max-width: 768px)");

  const toggleMenu = () => {
    setCollapsed(!collapsed);
  };

  useEffect(() => {
    const handleDocumentClick = (event) => {
      if (
        sideNavRef.current &&
        !sideNavRef.current.contains(event.target) &&
        !menuIconRef.current.contains(event.target)
      ) {
        setCollapsed(true);
      }
    };

  // Escucha los cambios en la media query
  const handleMediaChange = (event) => {
    if (event.matches) {
      document.addEventListener("click", handleDocumentClick);
    }
  };

  mediaQuery.addEventListener("change", handleMediaChange);

  if (mediaQuery.matches) {
    document.addEventListener("click", handleDocumentClick);
  }

  return () => {
    document.removeEventListener("click", handleDocumentClick);
    mediaQuery.removeEventListener("change", handleMediaChange);
  }; 
}, [mediaQuery]);

  return (
    <>
    {
      !collapsed && mediaQuery.matches&&(
        <div className="overlay" onClick={toggleMenu}></div>
      )}
    <div className={`side-nav ${!collapsed ? 'collapsed' : ''}`} ref={sideNavRef}>
      <div className="padding">
        <div className="nav-header">
          <div className="nav-item" onClick={toggleMenu} ref={menuIconRef}>
            <a href='#'>
              <i className="fas fa-bars menu-icon" style={{ fontSize: '17px', cursor: 'pointer' }}></i>
              <span class="menu-text"></span>
            </a>
          </div>
          <img src={logo} className="menu-title" style={{width:'30px',height:'30px',margin:'0'}} />
          <h3 className="menu-title" style={{ fontSize: '24px' }}>Lancaster</h3>
        </div>

        <div className="asd">
        <div className="nav-item"><Link to="/principal"><i className="fa-solid fa-house"></i><span className="menu-text">Principal</span></Link></div>
          <div className="nav-item"><Link to="/clientes"><i className="fa-solid fa-users"></i><span className="menu-text">Clientes</span></Link></div>
          <div className="nav-item"><Link to="/porcobrar"><i className="fa-solid fa-hand-holding-dollar"></i><span className="menu-text">Por Cobrar</span></Link></div>
          <div className="nav-item"><Link to="/porpagar"><i className="fa-solid fa-money-check-dollar"></i><span className="menu-text">Por Pagar</span></Link></div>
          <div className="nav-item"><a href="#"><i className="fas fa-calendar-alt"></i><span className="menu-text">Events</span></a></div>
          <div className="nav-item"><a href="#"><i className="fas fa-info-circle"></i><span className="menu-text">About</span></a></div>
          <div className="nav-item"><a href="#"><i className="fas fa-cogs"></i><span className="menu-text">Services</span></a></div>
          <div className="nav-item"><a href="#"><i className="fas fa-envelope"></i><span className="menu-text">Contact</span></a></div>
        </div>
      </div>
      <div className="logout">
        <a href="#"><Link to="/login"><i className="fas fa-sign-out-alt"></i><span className="menu-text">Cerrar Sesión</span></Link></a>
      </div>
    </div>
    </>
  );
}
export default SideNav;

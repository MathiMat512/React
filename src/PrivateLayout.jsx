import React from 'react';
import SideNav from './SideNav/SideNav';

const PrivateLayout = ({ children }) => {
  return (
    <>
      <SideNav />
      <div className="main-content">{children}</div>
    </>
  );
};

export default PrivateLayout;
import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
  return (
    <nav className="navbar fixed-top">
      <div className="navbar-left">
        <img src="./assets/logos/logo.png" alt="App Logo" className="navbar-logo" />
        <h1 className="navbar-title">Friend App</h1>
      </div>
      <div className="navbar-right">
        <Link to="/login" className="btn btn-transparent">
          Log In
        </Link>
        <Link to="/signup" className="btn btn-blue">
          Sign Up
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
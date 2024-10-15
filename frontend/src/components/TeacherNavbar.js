// TeacherNavbar.js
import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Navbar.css'; // Import the CSS file for styling
import logo from '../images/logo.png'
const TeacherNavbar = () => {
    function deleteCookie() {
        document.cookie = `userId=; expires=Thu, 01 Jan 1970 00:00:00 GMT;`
    }
    return (
        <nav className="navbar">
            <div className='navbar-content'>
                <div className="navbar-logo">
                    <Link to="/teacher"><img src={logo} alt="Logo" className="logo-img" /></Link>
                </div>
                <div className="navbar-links">
                    <Link to="/teacher" className='navbar-link'>Dashboard</Link>
                    <Link to="/teacher/assignments" className="navbar-link">Assignments</Link>
                    <Link to="/teacher/tests" className="navbar-link">MCQ Test</Link>
                    <Link to="/create_classroom" className="navbar-link">Create Classroom</Link>
                </div>
            </div>
            <button className="logout-button" >
                <Link to="/sign_in" onClick={deleteCookie} className='logout'>Logout  <i class="fa fa-sign-out" aria-hidden="true"></i></Link>
            </button>
        </nav>
    );
};

export default TeacherNavbar;

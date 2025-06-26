import React from 'react';
import { Link } from 'react-router-dom';
import './Navigation.css';

const Navigation: React.FC = () => {
    return (
        <nav className="navigation">
            <ul>
                <li>
                    <Link to="/">Home</Link>
                </li>
                <li>
                    <Link to="/catalogs">Catalogs</Link>
                </li>
                <li>
                    <Link to="/users">Users</Link>
                </li>
                <li>
                    <Link to="/permissions">Permisos</Link>
                </li>
                <li>
                    <Link to="/login">Login</Link>
                </li>
                <li>
                    <Link to="/reset-password">Reset Password</Link>
                </li>
                <li>
                    <Link to="/sign-out">Sign Out</Link>
                </li>
            </ul>
        </nav>
    );
};

export default Navigation;
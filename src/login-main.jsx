import React from 'react';
import { createRoot } from 'react-dom/client';
import Login from './Login.jsx';
import './tailwind.css';

const container = document.getElementById('login-app');
const root = createRoot(container);
root.render(<Login />);

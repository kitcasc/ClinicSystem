import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { ClinicProvider } from './context/ClinicContext';
import './index.css';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <ClinicProvider>
        <App />
      </ClinicProvider>
    </BrowserRouter>
  </React.StrictMode>
); 
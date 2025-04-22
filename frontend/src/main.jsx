import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/exam_allotment_css/index.css';
import './styles/exam_allotment_css/App.css';
import './styles/exam_allotment_css/Nav.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

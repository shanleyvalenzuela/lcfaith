import React from 'react';
import ReactDOM from 'react-dom/client';
import { MotionConfig } from 'motion/react';
import App from './App';
import './styles.css';
import './extra-styles.css';
import './whiteboard.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode><MotionConfig reducedMotion="user"><App /></MotionConfig></React.StrictMode>,
);

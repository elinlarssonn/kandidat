import logo from './logo.svg';
import React from 'react'
import './App.css';
import './Mobile.css';
import Home from './pages/Home';
import 'bootstrap/dist/css/bootstrap.min.css';

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import {LanguageProvider} from './LanguageContext';

function App() {
  return (
    <LanguageProvider> {}
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </Router>
    </LanguageProvider>
  );
}

export default App;


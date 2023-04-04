import './App.css';
import $ from 'jquery';
import React, { useEffect, useState }  from 'react';
import Main from './components/main';
import MainIndex from "./MainIndex.js";
import Development from "./Development.js";
import Loader from "./Loader.js";
import Login from "./login.js";
import { BrowserRouter as Router, Routes, Route}
    from 'react-router-dom';

function App() {
  return (
    <Router>

    <Routes>
        <Route exact path='/login' exact element={<Login />} />
        <Route exact path='/' exact element={<MainIndex />} />
        <Route exact path='/loader' exact element={<Loader />} />
        <Route path='/dev' element={<Development/>} />
    </Routes>
    </Router>
  );
}

export default App;

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Upload from '../Components/Upload';
import List from '../Components/List';

const AppRouter: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/upload/:src" Component={Upload} />
        <Route path="/list" Component={List} />
        <Route path="/" Component={List} />
      </Routes>
    </Router>
  );
};

export default AppRouter;

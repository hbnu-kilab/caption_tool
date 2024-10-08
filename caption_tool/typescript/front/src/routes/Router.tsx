import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Upload from '../Components/Upload';
import ReUpload from '../Components/ReUpload';

const AppRouter: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/upload/:src" Component={Upload} />
        <Route path="/reupload/:src" Component={ReUpload} />
        <Route path="/" Component={ReUpload} />
      </Routes>
    </Router>
  );
};

export default AppRouter;

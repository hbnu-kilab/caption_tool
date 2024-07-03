import React, { useEffect } from 'react';
import AppRouter from './routes/Router';

const App: React.FC = () => {
  
  useEffect(() => {
    setTimeout(() => {
      const doms = Array.from(document.getElementsByTagName("iframe"));
      doms.forEach(dom => {
        dom.remove();
      });
    }, 1500);
  }, []);

  return <AppRouter />;
};

export default App;

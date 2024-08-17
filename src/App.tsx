import { Nav, Footer, GeneratePass } from './_components';
import { AccountLayout } from './Account';
import { Home } from './Home';

import './App.css';
import { Routes, Route } from 'react-router-dom';

const App: React.FC = () => {
  return (
    <div className="app-container bg-opblack400 gap-5">
      <Nav />
      <div className="onepass-container">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="account/*" element={<AccountLayout />} />
          <Route path="password-generator" element={<GeneratePass />} />

          {/* Private Routes */}
        </Routes>
      </div>
      <Footer />
    </div>
  );
};

export default App;

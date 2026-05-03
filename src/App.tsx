import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Upload from './pages/Upload';
import Detail from './pages/Detail';
import Search from './pages/Search';
import About from './pages/About';

import Favorites from './pages/Favorites';

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/wishlist" element={<Favorites />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/app/:id" element={<Detail />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </Layout>
    </Router>
  );
}

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import SubjectPage from './pages/SubjectPage';
import './App.css'; // Globalni stilovi

function App() {
  return (
    <Router>
      <div className="app-content">
        {/* Navbar je uvek prisutan */}
        <Navbar />

        {/* Ovde se menjaju stranice */}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/subjects" element={<SubjectPage />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App;
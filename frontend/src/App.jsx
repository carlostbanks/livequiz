import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import StudentDashboard from './pages/StudentDashboard';
import Quiz from './pages/Quiz';
import AdminDashboard from './pages/AdminDashboard';
import TopicsManagement from './pages/TopicsManagement';
import QuestionsManagement from './pages/QuestionsManagement';
import ResultsViewer from './pages/ResultsViewer';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/student" element={<StudentDashboard />} />
        <Route path="/quiz/:topicId" element={<Quiz />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/topics" element={<TopicsManagement />} />
        <Route path="/admin/topics/:topicId/questions" element={<QuestionsManagement />} />
        <Route path="/admin/results" element={<ResultsViewer />} />
      </Routes>
    </Router>
  );
}

export default App;
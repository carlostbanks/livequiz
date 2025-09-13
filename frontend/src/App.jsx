import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import CasualQuizCreator from './pages/CasualQuizCreator';
import TakeQuiz from './pages/TakeQuiz';
// import QuizResults from './pages/QuizResults';
import Login from './pages/Login';
import Register from './pages/Register';
// import ProfessionalDashboard from './pages/ProfessionalDashboard';
// import QuizManagement from './pages/QuizManagement';
import ProtectedRoute from './components/ProtectedRoute';
import QuizShare from './pages/QuizShare';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/create-quiz" element={<CasualQuizCreator />} />
        <Route path="/quiz/share/:shareId" element={<QuizShare />} />
        <Route path="/quiz/take/:shareId" element={<TakeQuiz />} />


        {/* Auth routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Professional routes (protected) */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              {/* <ProfessionalDashboard /> */}
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/quiz/manage/:quizId" 
          element={
            <ProtectedRoute>
              {/* <QuizManagement /> */}
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;
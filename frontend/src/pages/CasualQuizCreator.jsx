// File: frontend/src/pages/CasualQuizCreator.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './CasualQuizCreator.css';

function CasualQuizCreator() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [generatingAnswer, setGeneratingAnswer] = useState(null);
  const [quiz, setQuiz] = useState({
    title: '',
    description: ''
  });
  const [questions, setQuestions] = useState([
    { question_text: '', answer_text: '' }
  ]);

  const handleQuizChange = (field, value) => {
    setQuiz(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleQuestionChange = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

  // AI Answer Generation Function
  const generateAIAnswer = async (questionText, questionIndex) => {
    if (!questionText.trim()) return;
    
    setGeneratingAnswer(questionIndex);
    
    try {
      console.log('Generating AI answer for:', questionText);
      
      const response = await fetch('http://localhost:3001/generate-answer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: questionText.trim()
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        const aiAnswer = data.answer;
        console.log('AI generated answer:', aiAnswer);
        
        // Update the specific question with the AI-generated answer
        handleQuestionChange(questionIndex, 'answer_text', aiAnswer);
        
      } else {
        throw new Error('Failed to generate answer');
      }
    } catch (aiError) {
      console.error('Error generating AI answer:', aiError);
      alert('Could not generate answer automatically. Please provide an answer manually.');
    } finally {
      setGeneratingAnswer(null);
    }
  };

  const addQuestion = () => {
    setQuestions(prev => [...prev, { question_text: '', answer_text: '' }]);
  };

  const removeQuestion = (index) => {
    if (questions.length > 1) {
      setQuestions(prev => prev.filter((_, i) => i !== index));
    }
  };

  const validateStep1 = () => {
    return quiz.title.trim() && quiz.description.trim();
  };

  const validateStep2 = () => {
    return questions.every(q => q.question_text.trim() && q.answer_text.trim());
  };

  const handleNextStep = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3);
    }
  };

  const handleCreateQuiz = async () => {
    setLoading(true);
    
    try {
      // Create the quiz
      const quizResponse = await fetch('http://localhost:3001/quizzes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: quiz.title,
          description: quiz.description,
          quiz_type: 'casual',
          questions: questions.map((q, index) => ({
            question_text: q.question_text,
            answer_text: q.answer_text,
            order_index: index + 1
          }))
        }),
      });

      if (quizResponse.ok) {
        const quizData = await quizResponse.json();
        
        // Simulate payment success (set stripe_paid to true)
        const paymentResponse = await fetch(`http://localhost:3001/quizzes/${quizData.quiz.id}/payment`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            payment_success: true 
          }),
        });

        if (paymentResponse.ok) {
          // Navigate to the share screen with the quiz share link
          navigate(`/quiz/share/${quizData.quiz.share_link_id}`);
        } else {
          throw new Error('Payment processing failed');
        }
      } else {
        throw new Error('Failed to create quiz');
      }
    } catch (error) {
      console.error('Error creating quiz:', error);
      alert('Failed to create quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="step-content">
      <div className="step-header">
        <h2>Create Your Quiz</h2>
        <p>Let's start with the basics</p>
      </div>

      <div className="form-group">
        <label htmlFor="title">Quiz Title</label>
        <input
          type="text"
          id="title"
          className="form-control"
          placeholder="e.g., JavaScript Basics Quiz"
          value={quiz.title}
          onChange={(e) => handleQuizChange('title', e.target.value)}
        />
      </div>

      <div className="form-group">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          className="form-control"
          rows="3"
          placeholder="Brief description of what this quiz covers..."
          value={quiz.description}
          onChange={(e) => handleQuizChange('description', e.target.value)}
        />
      </div>

      <div className="step-actions">
        <button 
          className="btn btn-primary"
          onClick={handleNextStep}
          disabled={!validateStep1()}
        >
          Next: Add Questions
          <i className="bi bi-arrow-right ms-2"></i>
        </button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="step-content">
      <div className="step-header">
        <h2>Add Questions</h2>
        <p>Create questions that participants will answer with their voice</p>
      </div>

      <div className="questions-list">
        {questions.map((question, index) => (
          <div key={index} className="question-card">
            <div className="question-header">
              <h5>Question {index + 1}</h5>
              {questions.length > 1 && (
                <button 
                  className="btn btn-outline-danger btn-sm"
                  onClick={() => removeQuestion(index)}
                >
                  <i className="bi bi-trash"></i>
                </button>
              )}
            </div>

            <div className="form-group">
              <label>Question</label>
              <input
                type="text"
                className="form-control"
                placeholder="What is the capital of France?"
                value={question.question_text}
                onChange={(e) => handleQuestionChange(index, 'question_text', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Answer</label>
              <div className="answer-input-section">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Leave blank to auto-generate with AI"
                  value={question.answer_text}
                  onChange={(e) => handleQuestionChange(index, 'answer_text', e.target.value)}
                />
                {question.question_text.trim() && !question.answer_text.trim() && (
                  <button
                    type="button"
                    className="btn btn-outline-primary btn-sm mt-2"
                    onClick={() => generateAIAnswer(question.question_text, index)}
                    disabled={generatingAnswer === index}
                  >
                    {generatingAnswer === index ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Generating...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-robot me-1"></i>
                        Generate with AI
                      </>
                    )}
                  </button>
                )}
              </div>
              {question.answer_text.trim() ? (
                <small className="form-text text-muted">
                  Custom answer provided. The AI will accept variations of this answer
                </small>
              ) : (
                <small className="form-text text-muted">
                  💡 <strong>Leave blank</strong> and AI will generate the correct answer automatically.
                </small>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="add-question-section">
        <button 
          className="btn btn-outline-primary"
          onClick={addQuestion}
        >
          <i className="bi bi-plus me-2"></i>
          Add Another Question
        </button>
      </div>

      <div className="step-actions">
        <button 
          className="btn btn-outline-secondary me-3"
          onClick={() => setCurrentStep(1)}
        >
          <i className="bi bi-arrow-left me-2"></i>
          Back
        </button>
        <button 
          className="btn btn-primary"
          onClick={handleNextStep}
          disabled={!validateStep2()}
        >
          Next: Review & Pay
          <i className="bi bi-arrow-right ms-2"></i>
        </button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="step-content">
      <div className="step-header">
        <h2>Review & Payment</h2>
        <p>Almost done! Review your quiz and complete payment</p>
      </div>

      <div className="quiz-summary">
        <div className="summary-card">
          <h4>{quiz.title}</h4>
          <p className="text-muted">{quiz.description}</p>
          <div className="quiz-stats">
            <span className="stat">
              <i className="bi bi-question-circle me-1"></i>
              {questions.length} Questions
            </span>
            <span className="stat">
              <i className="bi bi-mic me-1"></i>
              Voice Powered
            </span>
          </div>
        </div>

        <div className="payment-card">
          <div className="payment-header">
            <h5>Payment Summary</h5>
          </div>
          <div className="payment-details">
            <div className="payment-line">
              <span>Quiz Creation</span>
              <span>$1.00</span>
            </div>
            <div className="payment-line total">
              <span>Total</span>
              <span>$1.00</span>
            </div>
          </div>
          <div className="payment-info">
            <p className="text-muted">
              <i className="bi bi-shield-check me-1"></i>
              For development, payment is automatically approved
            </p>
          </div>
        </div>
      </div>

      <div className="step-actions">
        <button 
          className="btn btn-outline-secondary me-3"
          onClick={() => setCurrentStep(2)}
        >
          <i className="bi bi-arrow-left me-2"></i>
          Back
        </button>
        <button 
          className="btn btn-success"
          onClick={handleCreateQuiz}
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2"></span>
              Processing...
            </>
          ) : (
            <>
              <i className="bi bi-credit-card me-2"></i>
              Create Quiz ($1)
            </>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <div className="casual-quiz-creator">
      <Navbar variant="transparent" showAuth={false} />
      
      <div className="creator-container">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              
              {/* Progress Steps */}
              <div className="progress-steps">
                <div className={`step ${currentStep >= 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}>
                  <div className="step-circle">
                    {currentStep > 1 ? <i className="bi bi-check"></i> : '1'}
                  </div>
                  <span>Quiz Details</span>
                </div>
                <div className={`step ${currentStep >= 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}>
                  <div className="step-circle">
                    {currentStep > 2 ? <i className="bi bi-check"></i> : '2'}
                  </div>
                  <span>Add Questions</span>
                </div>
                <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>
                  <div className="step-circle">3</div>
                  <span>Review & Pay</span>
                </div>
              </div>

              {/* Step Content */}
              <div className="creator-card">
                {currentStep === 1 && renderStep1()}
                {currentStep === 2 && renderStep2()}
                {currentStep === 3 && renderStep3()}
              </div>

            </div>
          </div>
        </div>
      </div>

      <Footer variant="minimal" />
    </div>
  );
}

export default CasualQuizCreator;
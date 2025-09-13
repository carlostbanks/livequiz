// File: frontend/src/pages/TakeQuiz.jsx
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './TakeQuiz.css';

function TakeQuiz() {
  const { shareId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Voice recording states
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [processingVoice, setProcessingVoice] = useState(false);
  
  const audioRef = useRef(null);

  useEffect(() => {
    fetchQuizData();
  }, [shareId]);

  const fetchQuizData = async () => {
    try {
      const response = await fetch(`http://localhost:3001/quizzes/take/${shareId}`);
      if (!response.ok) {
        throw new Error('Quiz not found');
      }
      const data = await response.json();
      setQuiz(data.quiz);
      setQuestions(data.questions);
      setAnswers(new Array(data.questions.length).fill(''));
    } catch (error) {
      console.error('Error fetching quiz:', error);
      setError('Quiz not found or has been deleted');
    } finally {
      setLoading(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];

      recorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: 'audio/wav' });
        processVoiceInput(audioBlob);
        setAudioChunks([]);
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      setAudioChunks(chunks);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Please allow microphone access to answer questions with your voice.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      setProcessingVoice(true);
    }
  };

  const processVoiceInput = async (audioBlob) => {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'answer.wav');

      const response = await fetch('http://localhost:3001/transcribe-audio', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        const transcribedText = data.transcription;
        setCurrentAnswer(transcribedText);
        
        // Update answers array
        const newAnswers = [...answers];
        newAnswers[currentQuestion] = transcribedText;
        setAnswers(newAnswers);
      } else {
        throw new Error('Failed to transcribe audio');
      }
    } catch (error) {
      console.error('Error processing voice input:', error);
      alert('Failed to process voice input. Please try again.');
    } finally {
      setProcessingVoice(false);
    }
  };

  const handleTextInput = (value) => {
    setCurrentAnswer(value);
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = value;
    setAnswers(newAnswers);
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setCurrentAnswer(answers[currentQuestion + 1] || '');
    } else {
      completeQuiz();
    }
  };

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setCurrentAnswer(answers[currentQuestion - 1] || '');
    }
  };

  const completeQuiz = async () => {
    setSubmitting(true);
    
    try {
      // Calculate score by comparing answers
      let correctAnswers = 0;
      const detailedAnswers = questions.map((question, index) => {
        const userAnswer = answers[index] || '';
        const expectedAnswer = question.answer_text || '';
        
        // Simple scoring - check if user answer contains key words from expected answer
        const isCorrect = scoreAnswer(userAnswer, expectedAnswer);
        if (isCorrect) correctAnswers++;
        
        return {
          question_id: question.id,
          user_answer: userAnswer,
          expected_answer: expectedAnswer,
          is_correct: isCorrect
        };
      });

      const score = Math.round((correctAnswers / questions.length) * 100);

      const response = await fetch('http://localhost:3001/quiz-attempts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quiz_id: quiz.id,
          answers: detailedAnswers,
          score: score,
          status: 'completed'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setQuizCompleted(true);
        // Navigate to results page after a short delay
        setTimeout(() => {
          navigate(`/quiz/results/${data.attempt.id}`);
        }, 2000);
      } else {
        throw new Error('Failed to submit quiz');
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
      alert('Failed to submit quiz. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const scoreAnswer = (userAnswer, expectedAnswer) => {
    if (!userAnswer || !expectedAnswer) return false;
    
    const userWords = userAnswer.toLowerCase().split(/\s+/);
    const expectedWords = expectedAnswer.toLowerCase().split(/\s+/);
    
    // Check if user answer contains at least 50% of expected words
    let matchCount = 0;
    expectedWords.forEach(word => {
      if (userWords.some(userWord => userWord.includes(word) || word.includes(userWord))) {
        matchCount++;
      }
    });
    
    return matchCount >= Math.ceil(expectedWords.length * 0.5);
  };

  const startQuiz = () => {
    setQuizStarted(true);
    setCurrentAnswer(answers[0] || '');
  };

  if (loading) {
    console.log('⏳ Component in loading state');
    return (
      <div className="take-quiz-page">
        <Navbar variant="landing" />
        <div className="quiz-container">
          <div className="container py-5">
            <div className="text-center">
              <div className="spinner-border text-primary mb-3"></div>
              <h4>Loading quiz...</h4>
            </div>
          </div>
        </div>
        <Footer variant="minimal" />
      </div>
    );
  }

  if (error || !quiz) {
    console.log('❌ Component in error state. Error:', error, 'Quiz:', quiz);
    return (
      <div className="take-quiz-page">
        <Navbar variant="landing" />
        <div className="quiz-container">
          <div className="container py-5">
            <div className="row justify-content-center">
              <div className="col-lg-6">
                <div className="error-card">
                  <div className="error-icon">
                    <i className="bi bi-exclamation-triangle"></i>
                  </div>
                  <h3>Quiz Not Found</h3>
                  <p className="text-muted">
                    This quiz may have been deleted or the link is incorrect.
                  </p>
                  <button 
                    className="btn btn-primary"
                    onClick={() => navigate('/')}
                  >
                    Go Home
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer variant="minimal" />
      </div>
    );
  }

  if (quizCompleted) {
    console.log('🎉 Component in completed state');
    return (
      <div className="take-quiz-page">
        <Navbar variant="landing" />
        <div className="quiz-container">
          <div className="container py-5">
            <div className="row justify-content-center">
              <div className="col-lg-6">
                <div className="completion-card">
                  <div className="completion-icon">
                    <i className="bi bi-check-circle"></i>
                  </div>
                  <h3>Quiz Complete!</h3>
                  <p className="text-muted">
                    Thank you for taking the quiz. Your results are being processed...
                  </p>
                  <div className="spinner-border text-primary mt-3"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer variant="minimal" />
      </div>
    );
  }

  if (!quizStarted) {
    console.log('🏁 Component in intro state. Quiz data:', { title: quiz?.title, questionsCount: questions?.length });
    return (
      <div className="take-quiz-page">
        <Navbar variant="landing" />
        <div className="quiz-container">
          <div className="container py-5">
            <div className="row justify-content-center">
              <div className="col-lg-8">
                <div className="quiz-intro-card">
                  <div className="quiz-header">
                    <h1 className="quiz-title">{quiz.title}</h1>
                    <p className="quiz-description">{quiz.description}</p>
                  </div>
                  
                  <div className="quiz-details">
                    <div className="detail-item">
                      <i className="bi bi-question-circle"></i>
                      <span>{questions.length} Questions</span>
                    </div>
                    <div className="detail-item">
                      <i className="bi bi-mic"></i>
                      <span>Voice Powered</span>
                    </div>
                    <div className="detail-item">
                      <i className="bi bi-clock"></i>
                      <span>~{questions.length * 2} minutes</span>
                    </div>
                  </div>

                  <div className="instructions">
                    <h4>How it works:</h4>
                    <ol>
                      <li>Click the microphone button to record your answer</li>
                      <li>Speak clearly into your microphone</li>
                      <li>Click stop when you're done answering</li>
                      <li>Review and edit your answer if needed</li>
                      <li>Move to the next question</li>
                    </ol>
                    <p className="note">
                      <i className="bi bi-info-circle me-2"></i>
                      You can also type your answers if you prefer
                    </p>
                  </div>

                  <div className="start-section">
                    <button 
                      className="btn btn-primary btn-lg start-btn"
                      onClick={startQuiz}
                    >
                      <i className="bi bi-play-circle me-2"></i>
                      Start Quiz
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer variant="minimal" />
      </div>
    );
  }

  const currentQ = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="take-quiz-page">
      <Navbar variant="landing" />
      
      <div className="quiz-container">
        <div className="container py-4">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              
              {/* Progress Bar */}
              <div className="progress-section mb-4">
                <div className="progress-info">
                  <span className="question-counter">
                    Question {currentQuestion + 1} of {questions.length}
                  </span>
                  <span className="progress-percentage">
                    {Math.round(progress)}% Complete
                  </span>
                </div>
                <div className="progress">
                  <div 
                    className="progress-bar" 
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>

              {/* Question Card */}
              <div className="question-card">
                <div className="question-header">
                  <h2 className="question-text">{currentQ.question_text}</h2>
                </div>

                <div className="answer-section">
                  
                  {/* Voice Recording */}
                  <div className="voice-input">
                    <div className="recording-controls">
                      {!isRecording && answerState !== 'processing' ? (
                        <button 
                          className="btn btn-record"
                          onMouseDown={startRecording}
                          onMouseUp={stopRecording}
                          onMouseLeave={stopRecording}
                          onTouchStart={startRecording}
                          onTouchEnd={stopRecording}
                          disabled={processingVoice}
                        >
                          <i className="bi bi-mic"></i>
                          <span>Hold to Record</span>
                        </button>
                      ) : isRecording ? (
                        <button 
                          className="btn btn-recording"
                          onMouseUp={stopRecording}
                          onMouseLeave={stopRecording}
                          onTouchEnd={stopRecording}
                        >
                          <i className="bi bi-stop-circle"></i>
                          <span>Recording... {recordTime}s</span>
                        </button>
                      ) : (
                        <div className="processing-indicator">
                          <div className="spinner-border spinner-border-sm me-2"></div>
                          Processing your voice...
                        </div>
                      )}
                    </div>
                    
                    {answerState === 'correct' && (
                      <div className="answer-feedback correct">
                        <i className="bi bi-check-circle me-2"></i>
                        Correct! "{currentAnswer}"
                      </div>
                    )}
                    
                    {answerState === 'incorrect' && (
                      <div className="answer-feedback incorrect">
                        <i className="bi bi-x-circle me-2"></i>
                        Incorrect. You said: "{currentAnswer}"
                        <br />
                        <small>Expected: "{questions[currentQuestion]?.answer_text}"</small>
                      </div>
                    )}
                  </div>

                  {/* Text Input */}
                  <div className="text-input">
                    <label className="form-label">Your Answer:</label>
                    <textarea
                      className="form-control answer-input"
                      rows="3"
                      value={currentAnswer}
                      onChange={(e) => handleTextInput(e.target.value)}
                      placeholder="Speak your answer or type it here..."
                    ></textarea>
                  </div>
                </div>

                {/* Navigation */}
                <div className="question-navigation">
                  <button 
                    className="btn btn-outline-secondary"
                    onClick={previousQuestion}
                    disabled={currentQuestion === 0}
                  >
                    <i className="bi bi-arrow-left me-2"></i>
                    Previous
                  </button>
                  
                  <button 
                    className="btn btn-primary"
                    onClick={nextQuestion}
                    disabled={!currentAnswer.trim() || submitting}
                  >
                    {submitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Submitting...
                      </>
                    ) : currentQuestion === questions.length - 1 ? (
                      <>
                        Complete Quiz
                        <i className="bi bi-check-circle ms-2"></i>
                      </>
                    ) : (
                      <>
                        Next
                        <i className="bi bi-arrow-right ms-2"></i>
                      </>
                    )}
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      <Footer variant="minimal" />
    </div>
  );
}

export default TakeQuiz;
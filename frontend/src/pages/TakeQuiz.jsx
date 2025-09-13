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
  const [participantName, setParticipantName] = useState('');
  const [nameEntered, setNameEntered] = useState(false);
  
  // Voice recording states
  const [isRecording, setIsRecording] = useState(false);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [processingVoice, setProcessingVoice] = useState(false);
  const [recordTime, setRecordTime] = useState(0);
  const [answerState, setAnswerState] = useState(null); // null, 'processing', 'correct', 'incorrect'
  
  const mediaRecorderRef = useRef(null);
  const wsRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const processingStartTime = useRef(null);

  useEffect(() => {
    console.log('TakeQuiz component mounted with shareId:', shareId);
    fetchQuizData();
  }, [shareId]);

  useEffect(() => {
    console.log('WebSocket useEffect triggered. Questions length:', questions.length);
    
    if (questions.length === 0) {
      console.log('No questions yet, skipping WebSocket setup');
      return;
    }

    console.log('Setting up WebSocket connection...');
    
    // Set up WebSocket connection for real-time audio processing
    wsRef.current = new WebSocket('ws://localhost:3001');
    
    wsRef.current.onopen = () => {
      console.log('Connected to WebSocket server');
    };
    
    wsRef.current.onmessage = (event) => {
      console.log('Received WebSocket message:', event.data);
      const data = JSON.parse(event.data);
      
      if (data.type === 'transcription') {
        console.log('Transcription received:', data.text, 'Correct:', data.isCorrect);
        const transcribedText = data.text;
        setCurrentAnswer(transcribedText);
        
        // Update answers array
        const newAnswers = [...answers];
        newAnswers[currentQuestion] = transcribedText;
        setAnswers(newAnswers);
        
        // Set answer state based on correctness
        setAnswerState(data.isCorrect ? 'correct' : 'incorrect');
        setProcessingVoice(false);
        
        console.log('Answer processed. State:', data.isCorrect ? 'correct' : 'incorrect');
        
        // Auto-advance after last question
        if (currentQuestion === questions.length - 1) {
          console.log('Last question answered, auto-completing quiz...');
          setTimeout(() => {
            completeQuiz();
          }, 3000); // 3 second delay to show the result
        }
        
      } else if (data.type === 'error') {
        console.error('WebSocket error:', data.message);
        setProcessingVoice(false);
        setAnswerState(null);
        alert('Error processing voice: ' + data.message);
      }
    };
    
    wsRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    
    wsRef.current.onclose = () => {
      console.log('WebSocket connection closed');
    };
    
    return () => {
      console.log('Cleaning up WebSocket connection');
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [shareId, questions, currentQuestion, answers]);

  const fetchQuizData = async () => {
    console.log('Fetching quiz data for shareId:', shareId);
    try {
      const response = await fetch(`http://localhost:3001/quizzes/take/${shareId}`);
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        console.error('Response not OK:', response.status, response.statusText);
        throw new Error('Quiz not found');
      }
      
      const data = await response.json();
      console.log('Received quiz data:', data);
      
      setQuiz(data.quiz);
      setQuestions(data.questions);
      setAnswers(new Array(data.questions.length).fill(''));
      
      console.log('Quiz data set successfully');
    } catch (error) {
      console.error('Error fetching quiz:', error);
      setError('Quiz not found or has been deleted');
    } finally {
      setLoading(false);
      console.log('Loading finished');
    }
  };

  const startRecording = async () => {
    if (isRecording) return;
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorderRef.current.onstop = () => {
        if (audioChunksRef.current.length > 0) {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          if (audioBlob.size > 5000) {
            setProcessingVoice(true);
            setAnswerState('processing');
            processingStartTime.current = Date.now();
            sendAudioToServer(audioBlob);
          } else {
            alert('Please hold button longer and speak.');
          }
        } else {
          alert('No audio detected. Please try again.');
        }
        stream.getTracks().forEach(track => track.stop());
        clearInterval(timerRef.current);
        setRecordTime(0);
        setIsRecording(false);
      };
      
      mediaRecorderRef.current.start(100);
      setIsRecording(true);
      setAnswerState(null);

      const startTime = Date.now();
      timerRef.current = setInterval(() => {
        setRecordTime(((Date.now() - startTime) / 1000).toFixed(1));
      }, 100);

    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Microphone access denied. Please allow microphone access.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
  };

  const sendAudioToServer = (audioBlob) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Audio = reader.result.split(',')[1];
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'audio',
          data: base64Audio,
          question: {
            question: questions[currentQuestion].question_text,
            answer: questions[currentQuestion].answer_text
          }
        }));
      }
    };
    reader.readAsDataURL(audioBlob);
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setCurrentAnswer(answers[currentQuestion + 1] || '');
      setAnswerState(null);
      setProcessingVoice(false);
    } else {
      completeQuiz();
    }
  };

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setCurrentAnswer(answers[currentQuestion - 1] || '');
      setAnswerState(null);
      setProcessingVoice(false);
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
          participant_name: participantName,
          answers: detailedAnswers,
          score: score,
          status: 'completed'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setQuizCompleted(true);
        
        // Check if admin allows immediate results viewing
        const showResults = quiz.show_results_immediately || false;
        
        if (showResults) {
          setTimeout(() => {
            navigate(`/quiz/results/${data.attempt.id}`);
          }, 2000);
        } else {
          setTimeout(() => {
            navigate('/');
          }, 4000);
        }
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
    
    const userText = userAnswer.toLowerCase().trim();
    const expectedText = expectedAnswer.toLowerCase().trim();
    
    // Direct match
    if (userText === expectedText) return true;
    
    // Check if user answer contains the expected answer
    if (userText.includes(expectedText)) return true;
    
    // Check if expected answer contains the user answer
    if (expectedText.includes(userText)) return true;
    
    // Handle number words vs digits (e.g., "four" vs "4")
    const numberWords = {
      'zero': '0', 'one': '1', 'two': '2', 'three': '3', 'four': '4',
      'five': '5', 'six': '6', 'seven': '7', 'eight': '8', 'nine': '9',
      'ten': '10', 'eleven': '11', 'twelve': '12', 'thirteen': '13',
      'fourteen': '14', 'fifteen': '15', 'sixteen': '16', 'seventeen': '17',
      'eighteen': '18', 'nineteen': '19', 'twenty': '20'
    };
    
    // Convert number words to digits in both answers
    let userConverted = userText;
    let expectedConverted = expectedText;
    
    Object.entries(numberWords).forEach(([word, digit]) => {
      userConverted = userConverted.replace(new RegExp(`\\b${word}\\b`, 'g'), digit);
      expectedConverted = expectedConverted.replace(new RegExp(`\\b${word}\\b`, 'g'), digit);
    });
    
    // Check converted versions
    if (userConverted === expectedConverted) return true;
    if (userConverted.includes(expectedConverted)) return true;
    if (expectedConverted.includes(userConverted)) return true;
    
    // Check if they contain the same numbers/digits
    const userNumbers = userConverted.match(/\d+/g) || [];
    const expectedNumbers = expectedConverted.match(/\d+/g) || [];
    
    if (userNumbers.length > 0 && expectedNumbers.length > 0) {
      return userNumbers.some(num => expectedNumbers.includes(num));
    }
    
    return false;
  };

  const startQuiz = () => {
    console.log('Starting quiz. Questions available:', questions.length);
    console.log('First question:', questions[0]);
    setQuizStarted(true);
    setCurrentAnswer(answers[0] || '');
    console.log('Quiz started successfully');
  };

  const handleNameSubmit = () => {
    if (participantName.trim()) {
      setNameEntered(true);
    }
  };

  if (loading) {
    console.log('Component in loading state');
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
    console.log('Component in error state. Error:', error, 'Quiz:', quiz);
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
    console.log('Component in completed state');
    const showResults = quiz.show_results_immediately || false;
    
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
                    {showResults 
                      ? "Thank you for taking the quiz. Redirecting to your results..."
                      : `Thank you ${participantName} for taking the quiz! Redirecting to home page...`
                    }
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

  if (!nameEntered) {
    console.log('Component in name entry state');
    return (
      <div className="take-quiz-page">
        <Navbar variant="landing" />
        <div className="quiz-container">
          <div className="container py-5">
            <div className="row justify-content-center">
              <div className="col-lg-6">
                <div className="name-entry-card">
                  <div className="name-header">
                    <h2>Ready to Take the Quiz?</h2>
                    <p className="text-muted">Please enter your name to get started</p>
                  </div>
                  
                  <form onSubmit={(e) => { e.preventDefault(); handleNameSubmit(); }}>
                    <div className="form-group mb-4">
                      <label className="form-label">Your Name</label>
                      <input
                        type="text"
                        className="form-control name-input"
                        value={participantName}
                        onChange={(e) => setParticipantName(e.target.value)}
                        placeholder="Enter your first and last name"
                        required
                        autoFocus
                      />
                    </div>
                    
                    <button 
                      type="submit"
                      className="btn btn-primary btn-lg w-100"
                      disabled={!participantName.trim()}
                    >
                      Continue to Quiz
                      <i className="bi bi-arrow-right ms-2"></i>
                    </button>
                  </form>
                  
                  <div className="quiz-preview mt-4">
                    <h5>{quiz.title}</h5>
                    <p className="text-muted small">{quiz.description}</p>
                    <div className="preview-stats">
                      <span className="badge bg-light text-dark me-2">
                        <i className="bi bi-question-circle me-1"></i>
                        {questions.length} Questions
                      </span>
                      <span className="badge bg-light text-dark">
                        <i className="bi bi-mic me-1"></i>
                        Voice Only
                      </span>
                    </div>
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

  if (!quizStarted) {
    console.log('Component in intro state. Quiz data:', { title: quiz?.title, questionsCount: questions?.length });
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
                      <li>Hold down the microphone button</li>
                      <li>Speak your answer clearly</li>
                      <li>Release the button when done</li>
                      <li>See if you got it right!</li>
                      <li>Continue to the next question</li>
                    </ol>
                    <p className="note">
                      <i className="bi bi-info-circle me-2"></i>
                      This is a voice-only quiz - no typing allowed!
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
  
  console.log('Rendering quiz interface. Current question:', currentQuestion, 'Answer state:', answerState);

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
                      {!isRecording ? (
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
                      ) : (
                        <button 
                          className="btn btn-recording"
                          onMouseUp={stopRecording}
                          onMouseLeave={stopRecording}
                          onTouchEnd={stopRecording}
                        >
                          <i className="bi bi-stop-circle"></i>
                          <span>Recording... {recordTime}s</span>
                        </button>
                      )}
                      
                      {processingVoice && (
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
import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

function Quiz() {
  const { topicId } = useParams();
  const navigate = useNavigate();
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [feedback, setFeedback] = useState('');
  const [score, setScore] = useState(0);
  const [quizComplete, setQuizComplete] = useState(false);
  const [answers, setAnswers] = useState([]);

  const [answerState, setAnswerState] = useState(null);
  
  const [questions, setQuestions] = useState([]);
  const [topicName, setTopicName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [recordTime, setRecordTime] = useState(0);
  const timerRef = useRef(null);
  
  const mediaRecorderRef = useRef(null);
  const wsRef = useRef(null);
  const audioChunksRef = useRef([]);

  useEffect(() => {
    fetchTopicAndQuestions();
  }, [topicId]);

  const fetchTopicAndQuestions = async () => {
    try {
      setLoading(true);

      const { data: topicData, error: topicError } = await supabase
        .from('topics')
        .select('name')
        .eq('id', topicId)
        .single();

      if (topicError) throw topicError;
      
      const { data: questionsData, error: questionsError } = await supabase
        .from('questions')
        .select('*')
        .eq('topic_id', topicId)
        .order('order_index');

      if (questionsError) throw questionsError;

      if (questionsData.length === 0) {
        setError('No questions found for this topic');
        return;
      }

      setTopicName(topicData.name);
      setQuestions(questionsData);
    } catch (error) {
      console.error('Error fetching topic/questions:', error);
      setError('Failed to load quiz questions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (questions.length === 0) return;

    wsRef.current = new WebSocket('ws://localhost:3001');
    
    wsRef.current.onopen = () => {
      console.log('Connected to server');
    };
    
    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'transcription') {
        setTranscription(data.text);
        
        if (data.isCorrect) {
          setAnswerState('correct');
          setFeedback('Fantastic!');
        } else {
          setAnswerState('incorrect');
          setFeedback('Nice try!');
        }

        const newAnswer = {
          question: questions[currentQuestion].question_text,
          userAnswer: data.text,
          correct: data.isCorrect,
          correctAnswer: questions[currentQuestion].answer_text
        };
        
        setAnswers(prev => [...prev, newAnswer]);
        
        if (data.isCorrect) {
          setScore(prev => prev + 1);
        }
        
        setTimeout(() => {
          if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(prev => prev + 1);
            setTranscription('');
            setFeedback('');
            setAnswerState(null);
          } else {
            setQuizComplete(true);
            const finalScore = data.isCorrect ? score + 1 : score;
            const finalAnswers = [...answers, newAnswer];
            
            saveQuizResult(finalAnswers, finalScore);
          }
        }, 2000);
      } else if (data.type === 'error') {
        setTranscription('');
        setFeedback(data.message);
        setTimeout(() => setFeedback(''), 3000);
      }
    };
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [currentQuestion, score, answers, questions, topicName, topicId]);

  const saveQuizResult = async (finalAnswers, finalScore) => {
    try {
      const { error } = await supabase
        .from('quiz_results')
        .insert({
          topic_id: topicId,
          student_name: 'Anonymous',
          score: finalScore,
          total_questions: questions.length,
          answers_json: finalAnswers
        });

      if (error) {
        console.error('Error saving quiz result:', error);
      } else {
        console.log('Quiz result saved successfully');
      }
    } catch (error) {
      console.error('Error saving quiz result:', error);
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
            sendAudioToServer(audioBlob);
          } else {
            setFeedback('Please hold button longer and speak.');
            setTimeout(() => setFeedback(''), 2000);
          }
        } else {
          setFeedback('No audio detected. Please try again.');
          setTimeout(() => setFeedback(''), 2000);
        }
        stream.getTracks().forEach(track => track.stop());
        clearInterval(timerRef.current);
        setRecordTime(0);
        setIsRecording(false);
      };
      
      mediaRecorderRef.current.start(100);
      setIsRecording(true);
      setFeedback('');
      setTranscription('');

      const startTime = Date.now();
      timerRef.current = setInterval(() => {
        setRecordTime(((Date.now() - startTime) / 1000).toFixed(2));
      }, 10);

    } catch (error) {
      console.error('Error starting recording:', error);
      setFeedback('Microphone access denied. Please allow microphone access.');
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
      wsRef.current.send(JSON.stringify({
        type: 'audio',
        data: base64Audio,
        question: {
          question: questions[currentQuestion].question_text,
          answer: questions[currentQuestion].answer_text
        }
      }));
    };
    reader.readAsDataURL(audioBlob);
  };

  const restartQuiz = () => {
    setCurrentQuestion(0);
    setScore(0);
    setQuizComplete(false);
    setAnswers([]);
    setTranscription('');
    setFeedback('');
    setAnswerState(null);
  };

  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
  const formattedTime = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });

  const percentageScore = questions.length > 0 
    ? ((score / questions.length) * 100).toFixed(0) 
    : 0;

  if (loading) {
    return (
      <div className="container-fluid min-vh-100 d-flex flex-column align-items-center justify-content-center bg-stripe py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 text-secondary">Loading quiz...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fluid min-vh-100 d-flex flex-column align-items-center justify-content-center bg-stripe py-5">
        <div className="text-center w-100">
          <div className="card p-5 shadow-sm border-0">
            <h4 className="text-danger fw-bold mb-3">Quiz Error</h4>
            <p className="text-muted mb-4">{error}</p>
            <div className="d-flex flex-column flex-sm-row justify-content-center">
              <button 
                className="btn btn-primary me-sm-2 mb-2 mb-sm-0" 
                onClick={fetchTopicAndQuestions}
              >
                Try Again
              </button>
              <button className="btn btn-outline-secondary" onClick={() => navigate('/student')}>
                Back to Topics
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (quizComplete) {
    return (
      <div className="container-fluid min-vh-100 py-5 bg-stripe">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              
              <div className="text-center mb-5">
                <h1 className="display-4 fw-bold text-dark mb-2">Quiz Complete!</h1>
                <p className="lead text-secondary mb-1">{topicName}</p>
                <p className="lead text-secondary fs-6">{formattedDate} • {formattedTime}</p>
                <div className="card shadow-lg border-0 mb-4 rounded-3">
                  <div className="card-body p-5">
                    <h2 className="display-5 fw-bold text-dark mb-3">
                      Your Score: <span className="text-primary">{score}</span>/{questions.length} ({percentageScore}%)
                    </h2>
                    <p className="lead text-secondary">
                      {score === questions.length ? "Perfect score! 🌟" : 
                       score >= questions.length * 0.7 ? "Great job! 👏" : 
                       "Keep practicing! 💪"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="card shadow border-0 mb-4 rounded-3">
                <div className="card-header bg-primary text-white py-3 rounded-top-3">
                  <h3 className="card-title mb-0 h5 fw-semibold">Summary</h3>
                </div>
                <div className="card-body p-4">
                  {answers.map((answer, index) => (
                    <div 
                      key={index} 
                      className={`summary-item p-4 mb-3 rounded-3`}
                    >
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <h5 className="fw-semibold text-dark mb-0">Q{index + 1}: {answer.question}</h5>
                        <span className={`badge rounded-pill fs-6 fw-normal ${answer.correct ? 'bg-success' : 'bg-danger'}`}>
                            {answer.correct ? 'Correct' : 'Incorrect'}
                        </span>
                      </div>
                      <p className="text-secondary mb-1">
                        <span className="fw-semibold">Your answer:</span> {answer.userAnswer}
                      </p>
                      {!answer.correct && (
                        <p className="text-dark mb-0">
                          <span className="fw-semibold">Correct answer:</span> {answer.correctAnswer}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-center">
                <button 
                  onClick={restartQuiz}
                  className="btn btn-primary btn-lg px-5 me-sm-3 mb-2"
                >
                  <i className="bi bi-arrow-clockwise me-2"></i> Take Quiz Again
                </button>
                <button 
                  onClick={() => navigate('/student')}
                  className="btn btn-outline-secondary btn-lg px-5 mb-2"
                >
                  <i className="bi bi-grid me-2"></i> Choose Another Topic
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 d-flex flex-column bg-stripe">
      
      {/* Header Section */}
      <div className="header-container py-4">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8 d-flex justify-content-between align-items-center">
              <div>
                <h2 className="fw-bold mb-1 text-dark">{topicName}</h2>
                <span className="fs-6 fw-semibold text-secondary">
                  Question {currentQuestion + 1} of {questions.length}
                </span>
              </div>
              <button 
                className="btn btn-outline-secondary"
                onClick={() => navigate('/student')}
              >
                <i className="bi bi-arrow-left me-1"></i> Back to Topics
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content Section */}
      <div className={`content-wrapper flex-grow-1 d-flex flex-column py-5 ${answerState === 'correct' ? 'bg-correct' : answerState === 'incorrect' ? 'bg-incorrect' : ''}`}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8">
            
              {answerState ? (
                <div 
                  key={currentQuestion}
                  className={`card shadow-sm border-0 rounded-3 question-card text-center feedback-card`}
                  style={{ minHeight: '150px' }}
                >
                  <div className="card-body p-5 d-flex flex-column justify-content-center align-items-center">
                    <div className="answer-icon mb-3">
                      <i className={`bi bi-${answerState === 'correct' ? 'check-circle-fill' : 'x-circle-fill'}`}></i>
                    </div>
                    <h1 className="fw-bold display-4 mb-0 text-dark">{feedback}</h1>
                  </div>
                </div>
              ) : (
                <>
                  <div 
                    key={currentQuestion}
                    className={`card shadow-sm border-0 rounded-3 question-card text-center`}
                    style={{ minHeight: '150px' }}
                  >
                    <div className="card-body p-5 d-flex flex-column justify-content-center">
                      <h2 className="display-6 fw-bold mb-0 text-dark">
                        {questions[currentQuestion]?.question_text}
                      </h2>
                    </div>
                  </div>

                  <div className="text-center mt-5 mb-2">
                    <button 
                      className={`btn btn-lg px-5 py-4 fw-semibold border-0 ${
                        isRecording 
                          ? 'btn-danger pulsing-btn' 
                          : 'btn-primary'
                      }`}
                      onMouseDown={startRecording}
                      onMouseUp={stopRecording}
                      onMouseLeave={stopRecording}
                      onTouchStart={startRecording}
                      onTouchEnd={stopRecording}
                      style={{
                        minWidth: '250px',
                        fontSize: '1.1rem',
                      }}
                    >
                      <i className={`bi bi-mic${isRecording ? '-fill' : ''} me-2`}></i>
                      {isRecording ? 'Recording...' : 'Hold to Speak'}
                    </button>
                  </div>
                  {isRecording && (
                      <div className="text-center fw-normal fs-3 text-muted" style={{ minHeight: '1.5rem' }}>
                          {recordTime}s
                      </div>
                  )}
                  
                  {feedback && !isRecording && (
                      <div 
                        className="text-center text-danger fw-semibold" 
                        style={{ minHeight: '1.5rem' }}
                      >
                        {feedback}
                      </div>
                  )}
                  
                  {transcription && (
                    <div 
                      className="shadow-sm py-3 px-4 rounded-3 mt-3"
                      style={{animation: `slideInUp 0.3s ease-out 0s both`, backgroundColor: 'white'}}
                    >
                      <div className="fw-semibold text-dark">You said:</div>
                      <div className="text-secondary">{transcription}</div>
                    </div>
                  )}
                </>
              )}
            
            </div>
          </div>
        </div>
      </div>
      
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        * { font-family: 'Inter', sans-serif; }

        body {
            margin: 0;
            padding: 0;
        }

        .min-vh-100 { min-height: 100vh; }
        .d-flex { display: flex; }
        .flex-column { flex-direction: column; }
        .flex-grow-1 { flex-grow: 1; }
        
        .bg-stripe { background-color: #F9F9FB !important; transition: background-color 0.5s ease-in-out; }
        .bg-correct { background-color: #28A745 !important; transition: background-color 0.5s ease-in-out; }
        .bg-incorrect { background-color: #DC3545 !important; transition: background-color 0.5s ease-in-out; }
        
        .text-primary { color: #009C6B !important; }
        .text-secondary { color: #6C757D !important; }
        .text-dark { color: #212529 !important; }
        .text-white { color: white !important; }
        .text-success { color: #28A745 !important; }
        .text-danger { color: #DC3545 !important; }
        
        .btn { border-radius: 8px; font-weight: 500; }
        .btn-primary { background-color: #009C6B !important; color: white !important; border-color: #009C6B !important; transition: all 0.2s ease-in-out; }
        .btn-primary:hover { background-color: #007A54 !important; border-color: #007A54 !important; }
        
        .btn-outline-secondary { color: #6C757D !important; border-color: #E0E0E0 !important; font-weight: 500; }
        .btn-outline-secondary:hover { background-color: #E0E0E0 !important; }
        
        .btn-danger { background-color: #DC3545 !important; border-color: #DC3545 !important; color: white !important; }
        .btn-danger:hover { background-color: #C82333 !important; border-color: #C82333 !important; }

        .btn-white-text {
            color: white !important;
            border-color: white !important;
            background-color: transparent !important;
        }

        .header-container {
            width: 100%;
            background-color: #F9F9FB;
            border-bottom: 2px solid #E0E0E0;
        }

        .card { 
          border-radius: 12px; 
          transition: all 0.5s ease-in-out; 
        }
        
        .pulsing-btn { animation: pulse-border 1.5s infinite; }
        @keyframes pulse-border {
          0% { box-shadow: 0 0 0 0 rgba(220, 53, 69, 0.4); }
          70% { box-shadow: 0 0 0 15px rgba(220, 53, 69, 0); }
          100% { box-shadow: 0 0 0 0 rgba(220, 53, 69, 0); }
        }

        .summary-item {
            background-color: white;
            border: 1px solid #E9ECEF;
            transition: all 0.2s ease-in-out;
        }

        .summary-item:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 15px rgba(0,0,0,0.05);
        }

        .summary-correct {
            border-left: 4px solid #28A745;
        }
        
        .summary-incorrect {
            border-left: 4px solid #DC3545;
        }
        
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .question-card {
            animation: slideInFromRight 0.5s ease-out forwards;
        }

        .feedback-card {
            animation: none;
        }

        @keyframes slideInFromRight {
            0% { transform: translateX(100%); opacity: 0; }
            100% { transform: translateX(0); opacity: 1; }
        }

        .answer-icon {
            font-size: 8rem;
            animation: zoomIn 0.5s cubic-bezier(0.68, -0.55, 0.27, 1.55);
        }
        
        .bg-correct .answer-icon {
          color: white;
        }
        .bg-incorrect .answer-icon {
          color: white;
        }

        .feedback-card .text-dark {
          color: #212529 !important;
        }

        @keyframes zoomIn {
            from { transform: scale(0.5); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export default Quiz;
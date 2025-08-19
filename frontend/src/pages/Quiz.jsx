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
  
  // Database state
  const [questions, setQuestions] = useState([]);
  const [topicName, setTopicName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const mediaRecorderRef = useRef(null);
  const wsRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Fetch topic and questions from database
  useEffect(() => {
    fetchTopicAndQuestions();
  }, [topicId]);

  const fetchTopicAndQuestions = async () => {
    try {
      setLoading(true);
      
      // Fetch topic details
      const { data: topicData, error: topicError } = await supabase
        .from('topics')
        .select('name')
        .eq('id', topicId)
        .single();

      if (topicError) throw topicError;
      
      // Fetch questions for this topic
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

  // Connect to WebSocket
  useEffect(() => {
    if (questions.length === 0) return; // Don't connect until we have questions

    wsRef.current = new WebSocket('ws://localhost:3001');
    
    wsRef.current.onopen = () => {
      console.log('Connected to server');
    };
    
    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'transcription') {
        setTranscription(data.text);
        setFeedback(data.message);
        
        // Store the answer
        const newAnswer = {
          question: questions[currentQuestion].question_text,
          userAnswer: data.text,
          correct: data.isCorrect
        };
        
        setAnswers(prev => [...prev, newAnswer]);
        
        if (data.isCorrect) {
          setScore(prev => prev + 1);
        }
        
        // Move to next question after 2 seconds
        setTimeout(() => {
          if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(prev => prev + 1);
            setTranscription('');
            setFeedback('');
          } else {
            setQuizComplete(true);
            // Console log results for teacher
            console.log('Quiz Results:', {
              topic: topicName,
              topicId: topicId,
              score: data.isCorrect ? score + 1 : score,
              total: questions.length,
              answers: [...answers, newAnswer]
            });
            
            // Save results to database
            saveQuizResult([...answers, newAnswer], data.isCorrect ? score + 1 : score);
          }
        }, 2000);
      } else if (data.type === 'error') {
        // Handle errors - just show feedback, don't advance question
        setTranscription('');
        setFeedback(data.message);
        // Clear error after 3 seconds so user can try again
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
          student_name: 'Anonymous', // We'll add proper names later
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
    if (isRecording) return; // Prevent double-clicking
    
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
        // Check if we have audio data
        if (audioChunksRef.current.length > 0) {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          
          // Check if audio is substantial (more than 0.5 seconds worth)
          if (audioBlob.size > 5000) { // Increased threshold
            sendAudioToServer(audioBlob);
          } else {
            console.log('Audio too short, skipping...');
            // Don't show permanent error feedback, just brief message
            setFeedback('Please hold button longer and speak louder');
            // Clear the feedback after 2 seconds so user can try again
            setTimeout(() => setFeedback(''), 2000);
          }
        } else {
          console.log('No audio recorded');
          setFeedback('No audio detected. Please try again.');
          // Clear the feedback after 2 seconds so user can try again
          setTimeout(() => setFeedback(''), 2000);
        }
        
        // Stop all tracks to free up microphone
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorderRef.current.start(100); // Record in 100ms chunks
      setIsRecording(true);
      setFeedback(''); // Clear any previous feedback
    } catch (error) {
      console.error('Error starting recording:', error);
      setFeedback('Microphone access denied. Please allow microphone access.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const sendAudioToServer = (audioBlob) => {
    // Convert blob to base64 and send via WebSocket
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
  };

  // Loading state
  if (loading) {
    return (
      <div className="container-fluid bg-light min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted">Loading quiz...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container-fluid bg-light min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="alert alert-danger">
            <h4>Oops! Something went wrong</h4>
            <p>{error}</p>
            <button className="btn btn-primary me-2" onClick={fetchTopicAndQuestions}>
              Try Again
            </button>
            <button className="btn btn-outline-secondary" onClick={() => navigate('/student')}>
              Back to Topics
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (quizComplete) {
    return (
      <div className="container-fluid bg-light min-vh-100 py-5">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              
              {/* Header */}
              <div className="text-center mb-5">
                <h1 className="display-4 fw-bold text-primary mb-4">
                  🎉 Quiz Complete!
                </h1>
                <p className="lead text-muted">{topicName}</p>
                
                {/* Score Card */}
                <div className="card shadow-lg border-0 mb-4">
                  <div className="card-body p-5">
                    <h2 className="display-5 fw-bold text-success mb-3">
                      Your Score: {score}/{questions.length}
                    </h2>
                    <p className="lead text-muted">
                      {score === questions.length ? "Perfect score! 🌟" : 
                       score >= questions.length * 0.7 ? "Great job! 👏" : 
                       "Keep practicing! 💪"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Results Summary */}
              <div className="card shadow border-0 mb-4">
                <div className="card-header bg-primary text-white">
                  <h3 className="card-title mb-0 h5">📊 Summary</h3>
                </div>
                <div className="card-body p-4">
                  {answers.map((answer, index) => (
                    <div key={index} className={`alert ${
                      answer.correct ? 'alert-success' : 'alert-danger'
                    } border-start border-4`} style={{borderColor: answer.correct ? '#28a745' : '#dc3545'}}>
                      <div className="fw-semibold mb-1">
                        <strong>Q:</strong> {answer.question}
                      </div>
                      <div className="mb-1">
                        <strong>Your answer:</strong> {answer.userAnswer}
                      </div>
                      <div className={`fw-bold ${answer.correct ? 'text-success' : 'text-danger'}`}>
                        {answer.correct ? '✓ Correct' : '✗ Incorrect'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="text-center">
                <button 
                  onClick={restartQuiz}
                  className="btn btn-primary btn-lg px-5 py-3 me-3 mb-2"
                >
                  🔄 Take Quiz Again
                </button>
                <button 
                  onClick={() => navigate('/student')}
                  className="btn btn-outline-primary btn-lg px-5 py-3 mb-2"
                >
                  📚 Choose Another Topic
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid bg-light min-vh-100 py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h2 className="text-primary fw-bold mb-1">{topicName}</h2>
                <span className="badge bg-secondary fs-6 px-3 py-2">
                  Question {currentQuestion + 1} of {questions.length}
                </span>
              </div>
              <button 
                className="btn btn-outline-secondary"
                onClick={() => navigate('/student')}
              >
                ← Back to Topics
              </button>
            </div>

            {/* Question Card */}
            <div className="card shadow-lg border-0 mb-5">
              <div className="card-body text-center p-5">
                <h2 className="display-6 fw-bold text-dark mb-0">
                  {questions[currentQuestion]?.question_text}
                </h2>
              </div>
            </div>

            {/* Record Button */}
            <div className="text-center mb-4">
              <button 
                className={`btn btn-lg px-5 py-4 fw-semibold ${
                  isRecording 
                    ? 'btn-danger' 
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
                  animation: isRecording ? 'pulse 1.5s infinite' : 'none'
                }}
              >
                {isRecording ? '🎤 Recording...' : '🎤 Hold to Speak'}
              </button>
            </div>

            {/* Transcription */}
            {transcription && (
              <div className="alert alert-info border-start border-4 border-primary mb-3">
                <strong>You said:</strong> {transcription}
              </div>
            )}

            {/* Feedback */}
            {feedback && (
              <div className={`alert border-start border-4 ${
                feedback.includes('Correct') 
                  ? 'alert-success border-success' 
                  : 'alert-warning border-warning'
              }`}>
                <strong>{feedback}</strong>
              </div>
            )}

          </div>
        </div>
      </div>
      
      {/* Pulse animation */}
      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
}

export default Quiz;
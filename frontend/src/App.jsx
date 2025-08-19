import { useState, useRef, useEffect } from 'react';
import './App.css';

const QUESTIONS = [
  { id: 1, question: "What is 2 + 2?", answer: "4" },
  { id: 2, question: "What is 5 + 3?", answer: "8" },
  { id: 3, question: "What is 10 - 6?", answer: "4" }
];

function App() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [feedback, setFeedback] = useState('');
  const [score, setScore] = useState(0);
  const [quizComplete, setQuizComplete] = useState(false);
  const [answers, setAnswers] = useState([]);
  
  const mediaRecorderRef = useRef(null);
  const wsRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Connect to WebSocket
  useEffect(() => {
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
          question: QUESTIONS[currentQuestion].question,
          userAnswer: data.text,
          correct: data.isCorrect
        };
        
        setAnswers(prev => [...prev, newAnswer]);
        
        if (data.isCorrect) {
          setScore(prev => prev + 1);
        }
        
        // Move to next question after 2 seconds
        setTimeout(() => {
          if (currentQuestion < QUESTIONS.length - 1) {
            setCurrentQuestion(prev => prev + 1);
            setTranscription('');
            setFeedback('');
          } else {
            setQuizComplete(true);
            // Console log results for teacher
            console.log('Quiz Results:', {
              score: data.isCorrect ? score + 1 : score,
              total: QUESTIONS.length,
              answers: [...answers, newAnswer]
            });
          }
        }, 2000);
      }
    };
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [currentQuestion, score, answers]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };
      
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        sendAudioToServer(audioBlob);
      };
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
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
        question: QUESTIONS[currentQuestion]
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

  if (quizComplete) {
    return (
      <div className="quiz-container">
        <h1>Quiz Complete!</h1>
        <div className="score">
          <h2>Your Score: {score}/{QUESTIONS.length}</h2>
        </div>
        <div className="answers-summary">
          <h3>Summary:</h3>
          {answers.map((answer, index) => (
            <div key={index} className={`answer ${answer.correct ? 'correct' : 'incorrect'}`}>
              <p><strong>Q:</strong> {answer.question}</p>
              <p><strong>Your answer:</strong> {answer.userAnswer}</p>
              <p className="result">{answer.correct ? '✓ Correct' : '✗ Incorrect'}</p>
            </div>
          ))}
        </div>
        <button onClick={restartQuiz} className="restart-btn">
          Take Quiz Again
        </button>
      </div>
    );
  }

  return (
    <div className="quiz-container">
      <div className="progress">
        Question {currentQuestion + 1} of {QUESTIONS.length}
      </div>
      
      <div className="question">
        <h2>{QUESTIONS[currentQuestion].question}</h2>
      </div>

      <div className="recording-section">
        <button 
          className={`record-btn ${isRecording ? 'recording' : ''}`}
          onMouseDown={startRecording}
          onMouseUp={stopRecording}
          onTouchStart={startRecording}
          onTouchEnd={stopRecording}
        >
          {isRecording ? 'Recording...' : 'Hold to Speak'}
        </button>
      </div>

      {transcription && (
        <div className="transcription">
          <p><strong>You said:</strong> {transcription}</p>
        </div>
      )}

      {feedback && (
        <div className={`feedback ${feedback.includes('Correct') ? 'correct' : 'incorrect'}`}>
          <p>{feedback}</p>
        </div>
      )}
    </div>
  );
}

export default App;
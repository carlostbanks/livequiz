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
  }, [currentQuestion, score, answers]);

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
          onMouseLeave={stopRecording} // Stop if mouse leaves button while recording
          onTouchStart={startRecording}
          onTouchEnd={stopRecording}
        >
          {isRecording ? '🎤 Recording...' : '🎤 Hold to Speak'}
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
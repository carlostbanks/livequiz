const express = require('express');
const WebSocket = require('ws');
const cors = require('cors');
const http = require('http');
const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Middleware
app.use(cors());
app.use(express.json());

// Helper function to validate answers
function validateAnswer(userAnswer, expectedAnswer) {
  const normalizeAnswer = (text) => {
    return text.toLowerCase()
      .replace(/[^\w\s]/g, '') // Remove punctuation
      .replace(/\s+/g, ' ')    // Normalize spaces
      .trim();
  };

  const normalized = normalizeAnswer(userAnswer);
  const expected = normalizeAnswer(expectedAnswer);

  // Direct match
  if (normalized === expected) return true;

  // Number word to digit conversion
  const numberWords = {
    'zero': '0', 'one': '1', 'two': '2', 'three': '3', 'four': '4',
    'five': '5', 'six': '6', 'seven': '7', 'eight': '8', 'nine': '9',
    'ten': '10', 'eleven': '11', 'twelve': '12'
  };

  let convertedAnswer = normalized;
  Object.entries(numberWords).forEach(([word, digit]) => {
    convertedAnswer = convertedAnswer.replace(new RegExp(`\\b${word}\\b`, 'g'), digit);
  });

  // Check if converted answer matches
  if (convertedAnswer === expected || convertedAnswer.includes(expected)) return true;

  // Check if the expected answer is contained in the user's response
  if (normalized.includes(expected)) return true;

  return false;
}

// For math questions, validate that response contains numbers or math-related words
function isValidMathResponse(text, questionType = 'math') {
  const lowerText = text.toLowerCase().trim();
  
  if (questionType === 'math') {
    // Valid number words and digits - comprehensive
    const numberPattern = /\b(zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|\d+)\b/;
    
    // Valid math words  
    const mathWords = ['plus', 'minus', 'equals', 'is', 'add', 'subtract', 'answer'];
    const hasMathWords = mathWords.some(word => lowerText.includes(word));
    
    // Check for numbers in the text
    const hasNumbers = numberPattern.test(lowerText);
    
    console.log('Validation check:', {
      text: lowerText,
      hasNumbers,
      hasMathWords,
      numberMatches: lowerText.match(numberPattern)
    });
    
    // Must contain either a number or be a simple math expression
    return hasNumbers || hasMathWords;
  }
  
  return true; // For non-math questions, accept anything
}

// WebSocket connection handling
wss.on('connection', (ws) => {
  console.log('Client connected');
  
  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message);
      
      if (data.type === 'audio') {
        console.log('Processing audio for question:', data.question.question);
        
        try {
          // Convert base64 audio to buffer
          const audioBuffer = Buffer.from(data.data, 'base64');
          
          // Create temporary file with webm extension
          const tempFilePath = path.join(__dirname, `temp_audio_${Date.now()}.webm`);
          fs.writeFileSync(tempFilePath, audioBuffer);
          
          // Check file size - increase minimum size
          const stats = fs.statSync(tempFilePath);
          if (stats.size < 5000) { // Increased from 1000 to 5000 bytes
            fs.unlinkSync(tempFilePath);
            ws.send(JSON.stringify({
              type: 'error',
              message: 'Audio too short. Please speak longer and clearer.'
            }));
            return;
          }
          
          // Send to OpenAI Whisper
          const transcription = await openai.audio.transcriptions.create({
            file: fs.createReadStream(tempFilePath),
            model: 'whisper-1',
            language: 'en'
          });
          
          // Clean up temp file
          fs.unlinkSync(tempFilePath);
          
          const userText = transcription.text.trim();
          console.log('Transcribed text:', userText);
          console.log('Expected answer:', data.question.answer);
          
          // Validate that this is a valid math response
          if (!isValidMathResponse(userText, 'math')) {
            console.log('Rejected as invalid math response:', userText);
            ws.send(JSON.stringify({
              type: 'error',
              message: 'Please answer with a number (e.g., "four" or "4")'
            }));
            return;
          }
          
          // Validate answer
          const isCorrect = validateAnswer(userText, data.question.answer);
          
          // Send response back to frontend
          ws.send(JSON.stringify({
            type: 'transcription',
            text: userText,
            isCorrect: isCorrect,
            message: isCorrect ? 'Correct! ✓' : `Incorrect. The answer is ${data.question.answer}`
          }));
          
        } catch (error) {
          console.error('Error processing audio with Whisper:', error);
          ws.send(JSON.stringify({
            type: 'error',
            message: 'Error processing audio. Please try again.'
          }));
        }
      }
    } catch (error) {
      console.error('Error processing message:', error);
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Error processing request'
      }));
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

// Basic health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'Server running' });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
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
      .replace(/[^\w\s-]/g, '') // Keep hyphens for compound numbers
      .replace(/\s+/g, ' ')
      .trim();
  };

  const normalized = normalizeAnswer(userAnswer);
  const expected = normalizeAnswer(expectedAnswer);

  // Direct match
  if (normalized === expected) return true;

  if (normalized.includes(expected)) {
    return true;
  }

  // Number conversion logic (your existing code)
  const convertNumbersToDigits = (text) => {
    const ones = {
      'zero': 0, 'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5, 
      'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10, 
      'eleven': 11, 'twelve': 12, 'thirteen': 13, 'fourteen': 14, 
      'fifteen': 15, 'sixteen': 16, 'seventeen': 17, 'eighteen': 18, 'nineteen': 19
    };
    
    const tens = {
      'twenty': 20, 'thirty': 30, 'forty': 40, 'fifty': 50, 
      'sixty': 60, 'seventy': 70, 'eighty': 80, 'ninety': 90
    };

    text = text.replace(/(\w+)-(\w+)/g, (match, ten, one) => {
      const tenValue = tens[ten.toLowerCase()];
      const oneValue = ones[one.toLowerCase()];
      if (tenValue !== undefined && oneValue !== undefined) {
        return (tenValue + oneValue).toString();
      }
      return match;
    });

    Object.entries({...ones, ...tens}).forEach(([word, digit]) => {
      text = text.replace(new RegExp(`\\b${word}\\b`, 'g'), digit.toString());
    });

    return text;
  };

  const convertDigitsToWords = (text) => {
    const digitToWord = {
      '0': 'zero', '1': 'one', '2': 'two', '3': 'three', '4': 'four', '5': 'five',
      '6': 'six', '7': 'seven', '8': 'eight', '9': 'nine', '10': 'ten',
      '11': 'eleven', '12': 'twelve', '13': 'thirteen', '14': 'fourteen', '15': 'fifteen',
      '16': 'sixteen', '17': 'seventeen', '18': 'eighteen', '19': 'nineteen', '20': 'twenty',
      '30': 'thirty', '40': 'forty', '50': 'fifty', '60': 'sixty', '70': 'seventy',
      '80': 'eighty', '90': 'ninety'
    };

    text = text.replace(/\b([2-9])([1-9])\b/g, (match, tens, ones) => {
      const tensWord = digitToWord[tens + '0'];
      const onesWord = digitToWord[ones];
      if (tensWord && onesWord) {
        return `${tensWord}-${onesWord}`;
      }
      return match;
    });

    Object.entries(digitToWord).forEach(([digit, word]) => {
      text = text.replace(new RegExp(`\\b${digit}\\b`, 'g'), word);
    });

    return text;
  };

  // Convert both answers in both directions
  const userAsDigits = convertNumbersToDigits(normalized);
  const expectedAsDigits = convertNumbersToDigits(expected);
  const userAsWords = convertDigitsToWords(normalized);
  const expectedAsWords = convertDigitsToWords(expected);

  // Check all possible matches
  return userAsDigits === expectedAsDigits ||
         userAsDigits === expected ||
         normalized === expectedAsDigits ||
         userAsWords === expectedAsWords ||
         userAsWords === expected ||
         normalized === expectedAsWords ||
         userAsDigits === expectedAsWords ||
         userAsWords === expectedAsDigits;
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
          
          // Smart validation based on question content
          const isValidResponse = (text, question) => {
            const lowerText = text.toLowerCase().trim();
            const questionText = question.question.toLowerCase();
            
            // Detect question type based on content
            const isMathQuestion = /\b(\d+\s*[\+\-\*\/]\s*\d+|what\s+is\s+\d+|addition|subtraction|multiplication|division|how\s+many|how\s+much)\b/.test(questionText);
            
            if (isMathQuestion) {
              // Math question validation
              const numberPattern = /\b(zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|\d+)\b/;
              const mathWords = ['plus', 'minus', 'equals', 'is', 'add', 'subtract', 'answer'];
              const hasMathWords = mathWords.some(word => lowerText.includes(word));
              const hasNumbers = numberPattern.test(lowerText);
              
              console.log('Math question validation:', {
                text: lowerText,
                hasNumbers,
                hasMathWords,
                numberMatches: lowerText.match(numberPattern)
              });
              
              return hasNumbers || hasMathWords;
            } else {
              // Non-math questions: just check if response is substantial
              console.log('Non-math question validation:', {
                text: lowerText,
                length: lowerText.length,
                isSubstantial: lowerText.length >= 2
              });
              
              // Accept any response that's at least 2 characters and not just punctuation
              return lowerText.length >= 2 && /[a-zA-Z0-9]/.test(lowerText);
            }
          };
          
          if (!isValidResponse(userText, data.question)) {
            const questionText = data.question.question.toLowerCase();
            const isMathQuestion = /\b(\d+\s*[\+\-\*\/]\s*\d+|what\s+is\s+\d+|addition|subtraction|multiplication|division)\b/.test(questionText);
            
            console.log('Rejected response:', userText);
            ws.send(JSON.stringify({
              type: 'error',
              message: isMathQuestion 
                ? 'Please answer with a number (e.g., "four" or "4")'
                : 'Please give a clear answer to the question'
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

// Generate answer using OpenAI
app.post('/generate-answer', async (req, res) => {
  try {
    const { question } = req.body;
    
    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are helping create quiz answers. Provide very short, concise answers that students could easily speak aloud. For math questions, just give the number. For programming questions, give short keywords or phrases. Keep answers under 10 words and simple to pronounce.'
        },
        {
          role: 'user',
          content: `What is the correct answer to this question: "${question}"`
        }
      ],
      max_tokens: 50,
      temperature: 0.1
    });

    const answer = response.choices[0].message.content.trim();
    
    console.log('Generated answer for question:', question);
    console.log('Answer:', answer);
    
    res.json({ answer });
  } catch (error) {
    console.error('Error generating answer:', error);
    res.status(500).json({ error: 'Failed to generate answer' });
  }
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
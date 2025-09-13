const express = require('express');
const WebSocket = require('ws');
const cors = require('cors');
const http = require('http');
const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Initialize Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

// Middleware
app.use(cors());
app.use(express.json());

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Helper function to generate random string
const generateRandomString = (length = 8) => {
  return Math.random().toString(36).substring(2, length + 2);
};

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

  // Check if expected answer exists anywhere in user response
  if (normalized.includes(expected)) {
    return true;
  }

  // Simple character similarity for names/similar words
  const similarity = calculateSimilarity(normalized, expected);
  if (similarity > 0.8) { // 80% similarity threshold
    return true;
  }

  // Number conversion logic
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

function calculateSimilarity(str1, str2) {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const distance = levenshteinDistance(longer, shorter);
  return (longer.length - distance) / longer.length;
}

function levenshteinDistance(str1, str2) {
  const matrix = [];
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[str2.length][str1.length];
}

// AUTHENTICATION ENDPOINTS

// Register endpoint
app.post('/auth/register', async (req, res) => {
  try {
    const { email, password, subscription_type } = req.body;

    if (!email || !password || !subscription_type) {
      return res.status(400).json({ error: 'Email, password, and subscription type are required' });
    }

    if (!['casual', 'professional'].includes(subscription_type)) {
      return res.status(400).json({ error: 'Subscription type must be casual or professional' });
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Hash password
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Create user
    const { data: newUser, error } = await supabase
      .from('users')
      .insert({
        email,
        password_hash,
        subscription_type,
        stripe_paid: subscription_type === 'casual' ? true : false // Simulate payment for demo
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating user:', error);
      return res.status(500).json({ error: 'Failed to create user' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email, subscription_type: newUser.subscription_type },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        subscription_type: newUser.subscription_type,
        stripe_paid: newUser.stripe_paid
      }
    });

  } catch (error) {
    console.error('Error in register:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login endpoint
app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Get user from database
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check password
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, subscription_type: user.subscription_type },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        subscription_type: user.subscription_type,
        stripe_paid: user.stripe_paid
      }
    });

  } catch (error) {
    console.error('Error in login:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user
app.get('/auth/me', authenticateToken, async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, subscription_type, stripe_paid, created_at')
      .eq('id', req.user.userId)
      .single();

    if (error || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });

  } catch (error) {
    console.error('Error in get user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// QUIZ MANAGEMENT ENDPOINTS
app.post('/quizzes', async (req, res) => {
  try {
    const { title, description, quiz_type, questions } = req.body;

    if (!title || !quiz_type || !questions || questions.length === 0) {
      return res.status(400).json({ error: 'Title, quiz type, and questions are required' });
    }

    let creator_id = null;
    
    // If professional quiz, require authentication
    if (quiz_type === 'professional') {
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];
      
      if (!token) {
        return res.status(401).json({ error: 'Authentication required for professional quizzes' });
      }
      
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        creator_id = decoded.userId;
      } catch (err) {
        return res.status(403).json({ error: 'Invalid token' });
      }
    }

    // Generate unique share link ID
    const share_link_id = generateRandomString(12);

    // Create quiz - casual quizzes start unpaid
    const { data: newQuiz, error: quizError } = await supabase
      .from('quizzes')
      .insert({
        title,
        description,
        creator_id,
        quiz_type,
        share_link_id,
        stripe_paid: quiz_type === 'professional' ? true : false // Professional auto-paid, casual starts unpaid
      })
      .select()
      .single();

    if (quizError) {
      console.error('Error creating quiz:', quizError);
      return res.status(500).json({ error: 'Failed to create quiz' });
    }

    // Add questions
    const questionsWithQuizId = questions.map((q, index) => ({
      quiz_id: newQuiz.id,
      question_text: q.question_text,
      answer_text: q.answer_text,
      order_index: index + 1
    }));

    const { error: questionsError } = await supabase
      .from('questions')
      .insert(questionsWithQuizId);

    if (questionsError) {
      console.error('Error creating questions:', questionsError);
      // Cleanup quiz if questions failed
      await supabase.from('quizzes').delete().eq('id', newQuiz.id);
      return res.status(500).json({ error: 'Failed to create questions' });
    }

    res.status(201).json({
      quiz: newQuiz,
      share_url: `/quiz/take/${share_link_id}`
    });

  } catch (error) {
    console.error('Error in create quiz:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get quiz by share link (for taking quiz)
app.get('/quizzes/take/:shareId', async (req, res) => {
  try {
    const { shareId } = req.params;

    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .select('*')
      .eq('share_link_id', shareId)
      .eq('is_active', true)
      .single();

    if (quizError || !quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    // Check if quiz is paid for casual quizzes
    if (quiz.quiz_type === 'casual' && !quiz.stripe_paid) {
      return res.status(402).json({ error: 'Payment required' });
    }

    // Get questions
    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select('*')
      .eq('quiz_id', quiz.id)
      .order('order_index');

    if (questionsError) {
      console.error('Error fetching questions:', questionsError);
      return res.status(500).json({ error: 'Failed to fetch questions' });
    }

    res.json({
      quiz: {
        id: quiz.id,
        title: quiz.title,
        description: quiz.description,
        quiz_type: quiz.quiz_type,
        show_results_immediately: quiz.show_results_immediately
      },
      questions
    });

  } catch (error) {
    console.error('Error in get quiz:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's quizzes (professional only)
app.get('/quizzes', authenticateToken, async (req, res) => {
  try {
    const { data: quizzes, error } = await supabase
      .from('quizzes')
      .select(`
        *,
        questions:questions(count),
        quiz_attempts:quiz_attempts(count)
      `)
      .eq('creator_id', req.user.userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching quizzes:', error);
      return res.status(500).json({ error: 'Failed to fetch quizzes' });
    }

    res.json({ quizzes });

  } catch (error) {
    console.error('Error in get quizzes:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Generate unique quiz links for professional users
app.post('/quizzes/:quizId/payment', async (req, res) => {
  try {
    const { quizId } = req.params;
    const { payment_success } = req.body;

    if (payment_success) {
      const { error } = await supabase
        .from('quizzes')
        .update({ stripe_paid: true })
        .eq('id', quizId);

      if (error) throw error;

      res.json({ 
        success: true, 
        message: 'Payment processed successfully' 
      });
    } else {
      res.status(400).json({ error: 'Payment failed' });
    }
  } catch (error) {
    console.error('Error processing payment:', error);
    res.status(500).json({ error: 'Payment processing failed' });
  }
});

// Save quiz attempt
app.post('/quiz-attempts', async (req, res) => {
  try {
    const { quiz_id, taker_name, score, total_questions, answers_json, duration_seconds, unique_link_id } = req.body;

    if (!quiz_id || !taker_name || score === undefined || !total_questions || !answers_json) {
      return res.status(400).json({ error: 'Quiz ID, taker name, score, total questions, and answers are required' });
    }

    const { data: attempt, error } = await supabase
      .from('quiz_attempts')
      .insert({
        quiz_id,
        taker_name,
        score,
        total_questions,
        answers_json,
        duration_seconds,
        unique_link_id
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving quiz attempt:', error);
      return res.status(500).json({ error: 'Failed to save quiz attempt' });
    }

    // Mark quiz link as used if it's a professional quiz
    if (unique_link_id) {
      await supabase
        .from('quiz_links')
        .update({ used: true })
        .eq('link_token', unique_link_id);
    }

    res.status(201).json({ attempt });

  } catch (error) {
    console.error('Error in save quiz attempt:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get quiz attempts for a quiz (professional only)
app.get('/quizzes/:quizId/attempts', authenticateToken, async (req, res) => {
  try {
    const { quizId } = req.params;

    // Verify quiz belongs to user
    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .select('id')
      .eq('id', quizId)
      .eq('creator_id', req.user.userId)
      .single();

    if (quizError || !quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    const { data: attempts, error } = await supabase
      .from('quiz_attempts')
      .select('*')
      .eq('quiz_id', quizId)
      .order('completed_at', { ascending: false });

    if (error) {
      console.error('Error fetching quiz attempts:', error);
      return res.status(500).json({ error: 'Failed to fetch quiz attempts' });
    }

    res.json({ attempts });

  } catch (error) {
    console.error('Error in get quiz attempts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

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
              // Math question validation - updated regex to include all tens
              const numberPattern = /\b(zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|\d+)\b/;
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

// Simulate payment for casual quiz
app.post('/quizzes/:quizId/payment', async (req, res) => {
  try {
    const { quizId } = req.params;
    const { payment_success } = req.body;

    if (payment_success) {
      const { error } = await supabase
        .from('quizzes')
        .update({ stripe_paid: true })
        .eq('id', quizId);

      if (error) throw error;

      res.json({ 
        success: true, 
        message: 'Payment processed successfully' 
      });
    } else {
      res.status(400).json({ error: 'Payment failed' });
    }
  } catch (error) {
    console.error('Error processing payment:', error);
    res.status(500).json({ error: 'Payment processing failed' });
  }
});

// Get quiz share page info
app.get('/quizzes/share/:shareId', async (req, res) => {
  try {
    const { shareId } = req.params;

    const { data: quiz, error } = await supabase
      .from('quizzes')
      .select('id, title, description, share_link_id, stripe_paid')
      .eq('share_link_id', shareId)
      .single();

    if (error || !quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    const { count } = await supabase
      .from('questions')
      .select('*', { count: 'exact', head: true })
      .eq('quiz_id', quiz.id);

    res.json({
      ...quiz,
      question_count: count || 0,
      share_url: `${req.protocol}://${req.get('host')}/quiz/take/${shareId}`
    });
  } catch (error) {
    console.error('Error fetching share info:', error);
    res.status(500).json({ error: 'Failed to fetch quiz share info' });
  }
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
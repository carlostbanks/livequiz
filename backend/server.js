const express = require('express');
const WebSocket = require('ws');
const cors = require('cors');
const http = require('http');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Middleware
app.use(cors());
app.use(express.json());

// WebSocket connection handling
wss.on('connection', (ws) => {
  console.log('Client connected');
  
  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message);
      
      if (data.type === 'audio') {
        // TODO: Process audio with Whisper API
        console.log('Received audio data');
        
        // Mock response for now
        ws.send(JSON.stringify({
          type: 'transcription',
          text: 'four', // Mock transcription
          isCorrect: true,
          message: 'Correct!'
        }));
      }
    } catch (error) {
      console.error('Error processing message:', error);
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Error processing audio'
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
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Simple echo endpoint – receives audio blob and returns dummy transcript
app.post('/listen', upload.single('audio'), (req, res) => {
  // In a real implementation you would run STT on req.file.buffer
  const dummyTranscript = 'This is a placeholder transcript.';
  res.json({ transcript: dummyTranscript });
});

// Simple TTS endpoint – receives text and returns placeholder URL
app.post('/speak', (req, res) => {
  const { text } = req.body;
  // In a real implementation you would generate audio and serve it
  const placeholderUrl = `https://dummy-tts.example.com/audio?text=${encodeURIComponent(text)}`;
  res.json({ audioUrl: placeholderUrl });
});

const PORT = process.env.PORT || 4001;
app.listen(PORT, () => {
  console.log(`Voice Assistant backend listening on http://localhost:${PORT}`);
});

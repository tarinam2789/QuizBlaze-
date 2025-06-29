// const express = require('express');
// const path = require('path');
// const fs = require('fs');
// const fetch = require('node-fetch');  

// const app = express();
// const PORT = 3000;

// app.use(express.static('public'));
// app.use(express.urlencoded({ extended: true }));
// app.use(express.json());

// app.get('/', (req, res) => {
//   res.sendFile(path.join(__dirname, 'public', 'index.html'));
// });

// app.get('/api/questions', (req, res) => {
//   const questionsPath = path.join(__dirname, 'public', 'questions.json');
//   try {
//     const data = JSON.parse(fs.readFileSync(questionsPath, 'utf-8'));
//     const shuffled = data.sort(() => 0.5 - Math.random());
//     const count = parseInt(req.query.count || 10);
//     res.json(shuffled.slice(0, count));
//   } catch (err) {
//     res.status(500).json({ error: 'Failed to load questions' });
//   }
// });

// // New route to get questions from Trivia API
// app.get('/api/trivia', async (req, res) => {
//   try {
//     const amount = req.query.amount || 10;
//     const category = req.query.category || '';
//     const difficulty = req.query.difficulty || ''; 
//     const type = req.query.type || ''; 

//     // Build Trivia API URL with parameters
//     let url = `https://opentdb.com/api.php?amount=${amount}`;
//     if (category) url += `&category=${category}`;
//     if (difficulty) url += `&difficulty=${difficulty}`;
//     if (type) url += `&type=${type}`;

//     const response = await fetch(url);
//     if (!response.ok) {
//       throw new Error('Failed to fetch from Trivia API');
//     }
//     const data = await response.json();

//     if (data.response_code !== 0) {
//       return res.status(500).json({ error: 'Trivia API returned no results' });
//     }

//     res.json(data.results);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Failed to fetch trivia questions' });
//   }
// });

// app.post('/submit-score', (req, res) => {
//   const { name, score } = req.body;

//   if (!name || typeof score !== 'number') {
//     return res.status(400).json({ error: 'Missing name or score' });
//   }

//   const scoresPath = path.join(__dirname, 'scores.json');
//   let scores = [];

//   try {
//     const data = fs.readFileSync(scoresPath, 'utf-8');
//     scores = JSON.parse(data);
//   } catch (err) {
//     console.error('Error reading scores.json:', err);
//   }

//   scores.push({ name, score });

//   try {
//     fs.writeFileSync(scoresPath, JSON.stringify(scores, null, 2));
//     res.json({ message: 'Score saved successfully' });
//   } catch (err) {
//     res.status(500).json({ error: 'Failed to save score' });
//   }
// });

// app.get('/api/leaderboard', (req, res) => {
//   const scoresPath = path.join(__dirname, 'scores.json');
//   try {
//     const data = fs.readFileSync(scoresPath, 'utf-8');
//     const scores = JSON.parse(data);
//     const last20 = scores.slice(-20).reverse();
//     res.json(last20);
//   } catch (err) {
//     res.status(500).json({ error: 'Could not load leaderboard' });
//   }
// });

// app.listen(PORT, () => {
//   console.log(`✅ Express server running: http://localhost:${PORT}`);
// });

// const mongoose = require('mongoose');

// mongoose.connect('mongodb://localhost:27017/quizApp', {
//   useNewUrlParser: true,
//   useUnifiedTopology: true
// }).then(() => {
//   console.log('✅ Connected to MongoDB');
// }).catch(err => {
//   console.error('❌ MongoDB connection failed:', err);
// });


const express = require('express');
const path = require('path');
const fs = require('fs');
const fetch = require('node-fetch');  // npm install node-fetch@2

const app = express();
const PORT = 3000;

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Serve local questions (optional fallback)
app.get('/api/questions', (req, res) => {
  const questionsPath = path.join(__dirname, 'public', 'questions.json');
  try {
    const data = JSON.parse(fs.readFileSync(questionsPath, 'utf-8'));
    const shuffled = data.sort(() => 0.5 - Math.random());
    const count = parseInt(req.query.count || 10);
    res.json(shuffled.slice(0, count));
  } catch (err) {
    res.status(500).json({ error: 'Failed to load questions' });
  }
});

// New route to get questions from Trivia API
app.get('/api/trivia', async (req, res) => {
  try {
    const amount = req.query.amount || 10;
    const category = req.query.category || '';
    const difficulty = req.query.difficulty || ''; // easy, medium, hard
    const type = req.query.type || ''; // multiple, boolean

    // Build Trivia API URL with parameters
    let url = `https://opentdb.com/api.php?amount=${amount}`;
    if (category) url += `&category=${category}`;
    if (difficulty) url += `&difficulty=${difficulty}`;
    if (type) url += `&type=${type}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch from Trivia API');
    }
    const data = await response.json();

    if (data.response_code !== 0) {
      return res.status(500).json({ error: 'Trivia API returned no results' });
    }

    res.json(data.results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch trivia questions' });
  }
});

app.post('/submit-score', (req, res) => {
  const { name, score } = req.body;

  if (!name || typeof score !== 'number') {
    return res.status(400).json({ error: 'Missing name or score' });
  }

  const scoresPath = path.join(__dirname, 'scores.json');
  let scores = [];

  try {
    const data = fs.readFileSync(scoresPath, 'utf-8');
    scores = JSON.parse(data);
  } catch (err) {
    console.error('Error reading scores.json:', err);
  }

  scores.push({ name, score });

  try {
    fs.writeFileSync(scoresPath, JSON.stringify(scores, null, 2));
    res.json({ message: 'Score saved successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save score' });
  }
});

app.get('/api/leaderboard', (req, res) => {
  const scoresPath = path.join(__dirname, 'scores.json');
  try {
    const data = fs.readFileSync(scoresPath, 'utf-8');
    const scores = JSON.parse(data);
    const last20 = scores.slice(-20).reverse();
    res.json(last20);
  } catch (err) {
    res.status(500).json({ error: 'Could not load leaderboard' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Express server running: http://localhost:${PORT}`);
});

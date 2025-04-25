const express = require('express');
const cors = require('cors');
const fs = require ('fs');
const path = require ('path')

const app = express();

const corsOptions = {
  origin: 'http://localhost:3000', // Tillåt förfrågningar från denna origin
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());

const DATA_FILE = path.join(__dirname, 'answer.json');

app.get('/answers', (req, res) => {
    fs.readFile(DATA_FILE, 'utf8', (err, data) => {
      if (err) {
        return res.status(500).send('Kunde inte läsa svaren.');
      }
      const answers = JSON.parse(data || '[]');
      res.json(answers);
    });
  });

// Spara ett nytt svar
app.post('/answers', (req, res) => {
    console.log('Body:', req.body); // Lägg till för debugging
    const newAnswer = {
      userId: req.body.userId || null,
      answers: req.body.answers,
      createdAt: new Date().toISOString()
    };
  
    fs.readFile(DATA_FILE, 'utf8', (err, data) => {
      const answers = err ? [] : JSON.parse(data || '[]');
      answers.push(newAnswer);
      fs.writeFile(DATA_FILE, JSON.stringify(answers, null, 2), (err) => {
        if (err) {
          return res.status(500).send('Kunde inte spara svaret.');
        }
        res.status(201).send('Svar sparat!');
      });
    });
  });
  
  app.listen(5001, () => {
    console.log('Servern körs på http://localhost:5001');
  });
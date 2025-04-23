const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// Anslut till MongoDB
mongoose.connect('mongodb+srv://elinlarsson:b2NvKtypKF4Dp4AJ@kandidat.vgwnpdn.mongodb.net/?retryWrites=true&w=majority&appName=Kandidat', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('Ansluten till MongoDB!');
}).catch(err => {
    console.error('Kunde inte ansluta till MongoDB:', err);
});

// Skapa en schema och modell för svar
const answerSchema = new mongoose.Schema({
    userId: String,
    answers: Object,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Answer = mongoose.model('Answer', answerSchema);

// API-endpoint för att spara svar
app.post('/answers', async (req, res) => {
    const { userId, answers } = req.body;
    try {
        const newAnswer = new Answer({ userId, answers });
        await newAnswer.save();
        res.status(201).send('Svar sparat!');
    } catch (error) {
        res.status(500).send('Kunde inte spara svar.');
    }
});

// API-endpoint för att hämta alla svar
app.get('/answers', async (req, res) => {
    try {
        const allAnswers = await Answer.find();
        res.status(200).json(allAnswers);
    } catch (error) {
        console.error('Fel vid hämtning:', error);
        res.status(500).send('Kunde inte hämta svar.');
    }
});

// Starta servern
app.listen(5000, () => {
    console.log('Servern körs på http://localhost:5000');
});
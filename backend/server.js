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
    console.log('Body:', req.body); // Debugging
    const newAnswer = {
        userId: req.body.userId || null,
        answers: req.body.answers,
        createdAt: new Date().toISOString(), // Lägg till tidsstämpel
    };

    fs.readFile(DATA_FILE, 'utf8', (err, data) => {
        const answers = err ? [] : JSON.parse(data || '[]');

        // Dynamiskt skapa nästa index
        const nextIndex = answers.length > 0 ? Math.max(...answers.map(a => a.index || 0)) + 1 : 1;
        newAnswer.index = nextIndex; // Lägg till index i det nya svaret

        console.log('Nytt svar med index och tidsstämpel:', JSON.stringify(newAnswer, null, 2)); // Logga hela objektet

        answers.push(newAnswer); // Lägg till det nya svaret i listan

        fs.writeFile(DATA_FILE, JSON.stringify(answers, null, 2), (err) => {
            if (err) {
                console.error('Fel vid skrivning till fil:', err); // Logga skrivfel
                return res.status(500).send('Kunde inte spara svaret.');
            }
            console.log('Svar sparat till fil:', JSON.stringify(newAnswer, null, 2)); // Bekräfta att det sparades
            res.status(201).send('Svar sparat!');
        });
    });
});




// Funktion för att beräkna matchningspoäng
function calculateMatchScore(personA, personB) {
    let score = 0;

    // FRÅGA 4

    // 1. Komplementära intentioner
    const intentionsA = personA.answers[4] || [];
    const intentionsB = personB.answers[4] || [];
    const complementaryIntentions = intentionsA.some(intention =>
        (intention === "Hitta jobb" && intentionsB.includes("Rekrytera")) ||
        (intention === "Rekrytera" && intentionsB.includes("Hitta jobb")) ||
        (intention === "Hitta samarbetspartners" && intentionsB.includes("Hitta samarbetspartners")) ||
        (intention === "Träffa nya kontakter" && intentionsB.includes("Träffa nya kontakter")) ||
        (intention === "Starta ett projekt" && intentionsB.includes("Starta ett projekt"))
    );
    if (complementaryIntentions) score += 5;

    // dålig matchning som inte säger så mycket
    const noneOfTheAboveMatch = intentionsA.includes("Inget av ovan") && intentionsB.includes("Inget av ovan");
    if (noneOfTheAboveMatch) score += 2;

    // helt ok match?
    const projectCollaboration = 
        (intentionsA.includes("Hitta samarbetspartners") && intentionsB.includes("Starta ett projekt")) ||
        (intentionsA.includes("Starta ett projekt") && intentionsB.includes("Hitta samarbetspartners"));
    if (projectCollaboration) score += 3;

    // 2. Gemensam målgrupp (fråga 5)
    const targetGroupsA = personA.answers[5] || [];
    const targetGroupsB = personB.answers[5] || [];
    const sharedTargetGroups = targetGroupsA.filter(group => targetGroupsB.includes(group));
    score += sharedTargetGroups.length * 2;

    // 3. Komplementära branscher (fråga 6 och 7)
    const industriesA = personA.answers[6] || [];
    const industriesB = personB.answers[6] || [];
    const desiredIndustriesA = personA.answers[7] || [];
    const desiredIndustriesB = personB.answers[7] || [];

    // Supermatch: Om en persons bransch (fråga 6) matchar exakt med en annan persons önskade bransch (fråga 7) och vice versa
    const superMatch = industriesA.some(industry => desiredIndustriesB.includes(industry)) &&
                       industriesB.some(industry => desiredIndustriesA.includes(industry));
    if (superMatch) {
        score += 10; 
    }

    const sharedIndustries = industriesA.filter(industry => industriesB.includes(industry));
    score += sharedIndustries.length * 3;

    const rolesA = personA.answers[7] || [];
    const rolesB = personB.answers[7] || [];
    const sharedRoles = rolesA.filter(role => rolesB.includes(role));
    score += sharedRoles.length * 3;

    // 4. Gemensamma kompetenser (fråga 8)
    const skillsA = personA.answers[8] || [];
    const skillsB = personB.answers[8] || [];
    const sharedSkills = skillsA.filter(skill => skillsB.includes(skill));
    score += sharedSkills.length * 1;

    // 5. Erfarenhetsnivå (fråga 2)
    const experienceA = parseInt(personA.answers[2]) || 0;
    const experienceB = parseInt(personB.answers[2]) || 0;
    if (Math.abs(experienceA - experienceB) <= 2) score += 1;

    return score; // Returnera den totala matchningspoängen
}

// Endpoint för att matcha två personer
app.get('/match/:index1/:index2', (req, res) => {
    const { index1, index2 } = req.params;

    fs.readFile(DATA_FILE, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Kunde inte läsa svaren.');
        }

        const answers = JSON.parse(data || '[]');
        const personA = answers.find(person => person.index === parseInt(index1));
        const personB = answers.find(person => person.index === parseInt(index2));

        if (!personA || !personB) {
            return res.status(404).send('En eller båda personerna hittades inte.');
        }

        const matchScore = calculateMatchScore(personA, personB);

        // Logga resultatet i terminalen
        console.log(`Matchning mellan ${personA.userId} och ${personB.userId}:`);
        console.log(`Matchningspoäng: ${matchScore}`);

        res.json({ personA: personA.userId, personB: personB.userId, matchScore });
    });
});
  
app.listen(5001, () => {
    console.log('Servern körs på http://localhost:5001');
  });
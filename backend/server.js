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
        firstName: req.body.firstName || null, // Ta emot förnamn
        lastName: req.body.lastName || null,  // Ta emot efternamn
        answers: req.body.answers || {},     // Ta emot svar
        createdAt: new Date().toISOString(), // Lägg till tidsstämpel
    };

    fs.readFile(DATA_FILE, 'utf8', (err, data) => {
        if (err) {
            console.error('Fel vid läsning av fil:', err);
            return res.status(500).send('Kunde inte läsa svaren.');
        }

        let answers = JSON.parse(data || '[]');

        // Kontrollera om användaren redan finns
        const existingUserIndex = answers.findIndex(person => person.userId === newAnswer.userId);

        if (existingUserIndex !== -1) {
            // Uppdatera befintlig användare
            answers[existingUserIndex] = {
                ...answers[existingUserIndex], // Behåll befintliga fält
                firstName: newAnswer.firstName || answers[existingUserIndex].firstName,
                lastName: newAnswer.lastName || answers[existingUserIndex].lastName,
                answers: newAnswer.answers, // Uppdatera svar
                createdAt: newAnswer.createdAt, // Uppdatera tidsstämpel
            };
            console.log('Uppdaterade befintlig användare:', answers[existingUserIndex]);
        } else {
            // Skapa ny användare
            const nextIndex = answers.length > 0 ? Math.max(...answers.map(a => a.index || 0)) + 1 : 1;
            newAnswer.index = nextIndex;
            answers.push(newAnswer);
            console.log('Lade till ny användare:', newAnswer);
        }

        // Skriv tillbaka till filen
        fs.writeFile(DATA_FILE, JSON.stringify(answers, null, 2), (err) => {
            if (err) {
                console.error('Fel vid skrivning till fil:', err);
                return res.status(500).send('Kunde inte spara svaret.');
            }
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
    const complementaryIntentions = intentionsA.filter(intention =>
        (intention === "Hitta jobb" && intentionsB.includes("Rekrytera")) ||
        (intention === "Rekrytera" && intentionsB.includes("Hitta jobb")) ||
        (intention === "Hitta samarbetspartners" && intentionsB.includes("Hitta samarbetspartners")) ||
        (intention === "Träffa nya kontakter" && intentionsB.includes("Träffa nya kontakter")) ||
        (intention === "Starta ett projekt" && intentionsB.includes("Starta ett projekt"))
    );
    score += complementaryIntentions.length * 5; // Ge 5 poäng per komplementär intention

    // Komplementära intentioner, helt ok match?
    const projectCollaboration = intentionsA.filter(intention =>
        (intention === "Hitta samarbetspartners" && intentionsB.includes("Starta ett projekt")) ||
        (intention === "Starta ett projekt" && intentionsB.includes("Hitta samarbetspartners"))||

        (intention === "Bli inspirerad" && intentionsB.includes("Träffa nya kontakter"))||
        (intention === "Träffa nya kontakter" && intentionsB.includes("Bli inspirerad"))||

        (intention === "Nya kunder" && intentionsB.includes("Hitta samarbetspartners"))||
        (intention === "Hitta samarbetspartner" && intentionsB.includes("Nya kunder"))||

        (intention === "Nya kunder" && intentionsB.includes("Träffa nya kontakter"))||
        (intention === "Träffa nya kontakter" && intentionsB.includes("Nya kunder"))||

        (intention === "Träffa nya kontakter" && intentionsB.includes("Hitta samarbetspartners"))||
        (intention === "Hitta samarbetspartners" && intentionsB.includes("Träffa nya kontakter"))
    );
    score += projectCollaboration.length * 3; // Ge 3 poäng per projekt-samarbete

    console.log('Total poäng, komplementära intentioner:', score); // Logga poängen
    console.log('Total poäng fråga 4:', score); // Logga poängen

    //Fråga 3,5,6,7 - Mentor
    const currentUserWantsMentorsA = personA.answers[5]?.includes("Seniora yrkespersoner/mentorer");
    const currentUserInterestedInBranschA = personA.answers[7]?.some(bransch =>
            personB.answers[6]?.includes(bransch)
        );
    const otherUserWantsToMentorA = personB.answers[3] === "Ja";
    const otherUserWorksInBranschA = personB.answers[6]?.some(bransch =>
            personA.answers[7]?.includes(bransch)
        );

    const currentUserWantsMentorsB = personB.answers[5]?.includes("Seniora yrkespersoner/mentorer");
    const currentUserInterestedInBranschB = personB.answers[7]?.some(bransch =>
            personA.answers[6]?.includes(bransch)
        );
    const otherUserWantsToMentorB = personA.answers[3] === "Ja";
    const otherUserWorksInBranschB = personA.answers[6]?.some(bransch =>
            personB.answers[7]?.includes(bransch)
        );
 
    if (
        currentUserWantsMentorsA &&
        currentUserInterestedInBranschA &&
        otherUserWantsToMentorA &&
        otherUserWorksInBranschA
        ) {
            score += 4; // Öka poängen för denna matchning
        } else if (
            currentUserWantsMentorsB &&
            currentUserInterestedInBranschB &&
            otherUserWantsToMentorB &&
            otherUserWorksInBranschB
        ){
            score += 4; // Öka poängen för denna matchning
        }
        
        console.log('Poäng efter matchning med mentor', score); // Logga poängen

        //FRÅGA 5

    // 2. Sökande yrkesroller (fråga 5)
    const targetGroupsA = personA.answers[5] || [];
    const targetGroupsB = personB.answers[5] || [];
    const sharedTargetGroups = targetGroupsA.filter(group => targetGroupsB.includes(group));
    score += sharedTargetGroups.length * 2;
    console.log('Total poäng, mest intresserad av att prata med:', score); // Logga poängen


    //FRÅGA 6 & 7

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
        console.log('Total poäng söker samma bransch, supermatch:', score); // Logga poängen
    }
    //console.log('Poäng söker samma bransch, supermatch:', score); // Logga poängen

    const sharedIndustries = industriesA.some(industry => industriesB.includes(industry));
    if (sharedIndustries) {
        score += 5;
        console.log('Total poäng, jobbar i samma bransch:', score); // Logga poängen
    }

    const overlapingInterests = industriesA.some(industry => desiredIndustriesB.includes(industry)) ||
                                industriesB.some(industry => desiredIndustriesA.includes(industry));
    if (overlapingInterests) {
        score += 3;
        console.log('Total poäng efter att ha kollar overlapingInterests:', score); //Logga poäng
    }

    //FRÅGA 8

    // Gemensamma kompetenser (fråga 8)
    const skillsA = personA.answers[8] || [];
    const skillsB = personB.answers[8] || [];
    const sharedSkills = skillsA.filter(skill => skillsB.includes(skill));
    score += sharedSkills.length * 1;
    console.log('Total poäng gemensamma kompetenser:', score); // Logga poängen


    return score; // Returnera den totala matchningspoängen
}

// Endpoint för att matcha alla personer
app.get('/match-all', (req, res) => {
    const userId = req.query.userId; // Hämta userId från förfrågan
    if (!userId) {
        return res.status(400).send('UserId krävs för att hämta matchningar.');
    }

    fs.readFile(DATA_FILE, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Kunde inte läsa svaren.');
        }

        const answers = JSON.parse(data || '[]');
        const matchResults = [];

        // Hitta användaren som gör förfrågan
        const requestingUser = answers.find(person => person.userId === userId);
        if (!requestingUser) {
            return res.status(404).send('Användaren hittades inte.');
        }

        // Iterera över alla kombinationer av personer
        for (let i = 0; i < answers.length; i++) {
            const personB = answers[i];
            if (personB.userId === userId) continue; // Hoppa över samma person

            const matchScore = calculateMatchScore(requestingUser, personB);

            matchResults.push({
                userA: {
                    userId: requestingUser.userId,
                    firstName: requestingUser.firstName || "Okänd",
                    lastName: requestingUser.lastName || "Okänd"
                },
                userB: {
                    userId: personB.userId,
                    firstName: personB.firstName || "Okänd",
                    lastName: personB.lastName || "Okänd"
                },
                matchScore,
            });
        }

        // Sortera matchningsresultaten efter poäng i fallande ordning
        matchResults.sort((a, b) => b.matchScore - a.matchScore);

        // Returnera de tre högsta matchningarna
        const topMatches = matchResults.slice(0, 3);
        res.json(topMatches);
        console.log(`Topp 3 matchningsresultat för userId ${userId}:`, topMatches); // Logga topp 3 matchningsresultaten med userId
    });
});

// Endpoint för att dynamiskt uppdatera matchningar för alla personer
app.get('/match-all-dynamic', (req, res) => {
    const userId = req.query.userId; // Hämta userId från förfrågan
    if (!userId) {
        return res.status(400).send('UserId krävs för att hämta matchningar.');
    }

    fs.readFile(DATA_FILE, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Kunde inte läsa svaren.');
        }

        const answers = JSON.parse(data || '[]');
        const matchResults = [];

        // Iterera över alla kombinationer av personer
        for (let i = 0; i < answers.length; i++) {
            const personA = answers[i];
            if (personA.userId !== userId) continue; // Endast matchningar för det angivna userId

            for (let j = 0; j < answers.length; j++) {
                if (i === j) continue; // Hoppa över samma person
                const personB = answers[j];
                const matchScore = calculateMatchScore(personA, personB);

                matchResults.push({
                    userA: personA.userId,
                    userB: personB.userId,
                    matchScore,
                });
            }
        }

        // Sortera matchningsresultaten efter poäng i fallande ordning
        matchResults.sort((a, b) => b.matchScore - a.matchScore);

        // Returnera de tre högsta matchningarna
        const topMatches = matchResults.slice(0, 3);
        res.json(topMatches);
        console.log(`Topp 3 dynamiska matchningsresultat för userId ${userId}:`, topMatches); // Logga topp 3 dynamiska matchningsresultaten med userId
    });
});

app.listen(5001, () => {
    console.log('Servern körs på http://localhost:5001');
  });
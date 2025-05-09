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
                ...answers[existingUserIndex],
                answers: { ...answers[existingUserIndex].answers, ...newAnswer.answers }, // Uppdatera svar
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

app.get('/has-answered', (req, res) => {
    const userId = req.query.userId;
    if (!userId) {
        return res.status(400).send('UserId krävs.');
    }

    fs.readFile(DATA_FILE, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Kunde inte läsa svaren.');
        }

        const answers = JSON.parse(data || '[]');
        const user = answers.find(person => person.userId === userId);

        res.json({
            exists: !!user, // Om användaren finns
            hasAnswered: !!user && !!user.answers && Object.keys(user.answers).length > 0 // Om användaren har svarat
        });
    });
});

// Funktion för att beräkna matchningspoäng
function calculateMatchScore(personA, personB) {
    let score = 0;

    // Komplementära intentioner
    const intentionsA = personA.answers[4] || [];
    const intentionsB = personB.answers[4] || [];
    const complementaryIntentions = intentionsA.filter(intention =>
        (intention === "goal-job" && intentionsB.includes("goal-recruit")) ||
        (intention === "goal-recruit" && intentionsB.includes("goal-job")) ||
        (intention === "goal-partners" && intentionsB.includes("goal-partners")) ||
        (intention === "goal-contacts" && intentionsB.includes("goal-contacts")) ||
        (intention === "goal-project" && intentionsB.includes("goal-project"))
    );
    score += complementaryIntentions.length * 5; // Ge 5 poäng per komplementär intention

    // Komplementära intentioner, helt ok match?
    const projectCollaboration = intentionsA.filter(intention =>
        (intention === "goal-partners" && intentionsB.includes("goal-project")) ||
        (intention === "goal-project" && intentionsB.includes("goal-partners"))||

        (intention === "goal-inspiration" && intentionsB.includes("goal-contacts"))||
        (intention === "goal-contacts" && intentionsB.includes("goal-inspiration"))||

        (intention === "goal-customers" && intentionsB.includes("goal-partners"))||
        (intention === "goal-partners" && intentionsB.includes("goal-customers"))||

        (intention === "goal-customers" && intentionsB.includes("goal-contacts"))||
        (intention === "goal-contacts" && intentionsB.includes("goal-customers"))||

        (intention === "goal-contacts" && intentionsB.includes("goal-partners"))||
        (intention === "goal-partners" && intentionsB.includes("goal-contacts"))
    );
    score += projectCollaboration.length * 3; // Ge 3 poäng per projekt-samarbete
    
    console.log('intentioner:', complementaryIntentions);
    console.log('komplemtära intentioner:', projectCollaboration); // Logga komplementära intentioner
    console.log('Total poäng, komplementära intentioner:', score); // Logga poängen

    //Fråga 3,5,6,7 - Mentor
    const currentUserWantsMentorsA = personA.answers[5]?.includes("type-senior");
    const currentUserInterestedInBranschA = personA.answers[7]?.some(bransch =>
            personB.answers[6]?.includes(bransch)
        );
    const otherUserWantsToMentorA = personB.answers[3] === "yes";
    const otherUserWorksInBranschA = personB.answers[6]?.some(bransch =>
            personA.answers[7]?.includes(bransch)
        );

    const currentUserWantsMentorsB = personB.answers[5]?.includes("type-senior");
    const currentUserInterestedInBranschB = personB.answers[7]?.some(bransch =>
            personA.answers[6]?.includes(bransch)
        );
    const otherUserWantsToMentorB = personA.answers[3] === "yes";
    const otherUserWorksInBranschB = personA.answers[6]?.some(bransch =>
            personB.answers[7]?.includes(bransch)
        );
 
    if (
        currentUserWantsMentorsA &&
        currentUserInterestedInBranschA &&
        otherUserWantsToMentorA &&
        otherUserWorksInBranschA
        ) {
            score += 5; // Öka poängen för denna matchning
        } else if (
            currentUserWantsMentorsB &&
            currentUserInterestedInBranschB &&
            otherUserWantsToMentorB &&
            otherUserWorksInBranschB
        ){
            score += 5; // Öka poängen för denna matchning
        }
        
        console.log('Total poäng efter matchning med mentor', score); // Logga poängen


    // 3. Komplementära branscher (fråga 6 och 7)
    const industriesA = personA.answers[6] || [];
    const industriesB = personB.answers[6] || [];
    const desiredIndustriesA = personA.answers[7] || [];
    const desiredIndustriesB = personB.answers[7] || [];

    // Supermatch: Om en persons bransch (fråga 6) matchar exakt med en annan persons önskade bransch (fråga 7) och vice versa
    const superMatch = industriesA.some(industry => desiredIndustriesB.includes(industry)) &&
                       industriesB.some(industry => desiredIndustriesA.includes(industry));
    if (superMatch) {
        score += 5; 
        console.log('Total poäng söker samma bransch, supermatch:', score); // Logga poängen
    }

    const sharedIndustries = industriesA.some(industry => industriesB.includes(industry));
    if (sharedIndustries) {
        score += 3;
        console.log('Total poäng, jobbar i samma bransch:', score); // Logga poängen
    }

    const overlapingInterests = industriesA.some(industry => desiredIndustriesB.includes(industry)) ||
                                industriesB.some(industry => desiredIndustriesA.includes(industry));
    if (overlapingInterests) {
        score += 2;
        console.log('Total poäng efter att ha kollar overlapingInterests:', score); //Logga poäng
    }

    // Gemensamma kompetenser (fråga 8)
    const skillsA = personA.answers[8] || [];
    const skillsB = personB.answers[8] || [];
    const sharedSkills = skillsA.filter(skill => skillsB.includes(skill));
    score += sharedSkills.length * 1;
    console.log('Total poäng gemensamma kompetenser:', score); // Logga poängen

    // FRÅGA 1 & 5 - Liknande yrkesroll och specifika målgrupper
    const roleA = personA.answers[1];
    const roleB = personB.answers[1];
    const targetGroupsA = personA.answers[5] || [];
    const targetGroupsB = personB.answers[5] || [];

    // Matcha personer som vill prata med "Folk med liknande yrkesroll"
    if (targetGroupsA.includes("type-similar-role") && roleA === roleB) {
        score += 2; // Ge 2 poäng för liknande yrkesroll
    }
    if (targetGroupsB.includes("type-similar-role") && roleA === roleB) {
        score += 2; // Ge 2 poäng för liknande yrkesroll
    }

    // Matcha personer som vill träffa en viss person med personer som har den yrkesrollen
    targetGroupsA
        .filter(target => ["type-student","type-graduate", "type-recruiter", "type-entrepreneur", "type-ceo"].includes(target))
        .forEach(target => {
            if (roleB === target) {
                score += 2; // Ge 2 poäng för matchande yrkesroll
            }
        });

    targetGroupsB
        .filter(target => ["type-student","type-graduate", "type-recruiter", "type-entrepreneur", "type-ceo"].includes(target))
        .forEach(target => {
            if (roleA === target) {
                score += 2; // Ge 2 poäng för matchande yrkesroll
            }
        });

    console.log('Total poäng efter yrkesroll och målgruppsmatchning:', score); // Logga poängen

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
app.get('/match-rest', (req, res) => {
    const userId = req.query.userId;
    if (!userId) return res.status(400).send('UserId krävs.');
  
    fs.readFile(DATA_FILE, 'utf8', (err, data) => {
      if (err) return res.status(500).send('Kunde inte läsa svaren.');
  
      const answers = JSON.parse(data || '[]');
      const requestingUser = answers.find(person => person.userId === userId);
      if (!requestingUser) return res.status(404).send('Användaren hittades inte.');
  
      const matchResults = answers
        .filter(p => p.userId !== userId)
        .map(personB => ({
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
          matchScore: calculateMatchScore(requestingUser, personB)
        }))
        .sort((a, b) => b.matchScore - a.matchScore);
  
      res.json(matchResults.slice(3, 8));

      const moreMatches = moreMatches.slice(4, 8);
      res.json(moreMatches);
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
    });
});

app.listen(5001, () => {
    console.log('Servern körs på http://localhost:5001');
  });
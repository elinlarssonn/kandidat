import React, { useState } from 'react';
import Button from '../components/button';
import Questions from '../components/questions';
import MatchResults from '../components/match'; // Importera MatchResults
import Header from '../components/header'; 


const VIEW_START = 1;
const VIEW_CONSENT = 2;
const VIEW_USER = 3;
const VIEW_QUESTIONS = 4;
const VIEW_RESULTS = 5; // Ny vy för matchningsresultat

function Home() {
    const [view, setView] = useState(VIEW_START);
    const [email, setEmail] = useState(''); //state för att lagra mejl
  
    return (
      <div className="home-page">

        {view === VIEW_START && (
          <>
            <Header title="Inför Eventet" />
            <StartPage goTo={setView} />
          </>
        )}

        {view === VIEW_CONSENT && (
          <>
            <Header title="Samtycke" onBack={() => setView(VIEW_START)} />
            <Consent goTo={setView} />
          </>
        )}

        {view === VIEW_USER && (
          <>
            <Header title="Personuppgifter" onBack={() => setView(VIEW_CONSENT)} />
            <User goTo={setView} setEmail={setEmail} />
          </>
        )}

        {view === VIEW_QUESTIONS && (
          <>
            <Header title="Frågor om dig" onBack={() => setView(VIEW_USER)} />
            <Questions goTo={setView} email={email} />
          </>
        )}

        {view === VIEW_RESULTS && (
          <>
            <Header title="Dina matchningar" onBack={() => setView(VIEW_QUESTIONS)} />
            <MatchResults goTo={setView} userId={email} refresh={() => setView(VIEW_RESULTS)} />
          </>
        )}

      </div>
    );
  }
  

function StartPage({ goTo }) {
  return (
    <div className="start-content">
      <h1>Frågor om dig</h1>
      <p>
        Svara gärna på några snabba frågor – det hjälper oss att matcha dig med
        relevanta kontakter under eventet.
      </p>
      <Button label="Starta" onClick={() => goTo(VIEW_CONSENT)} />
    </div>
  );
}


function Consent({ goTo }) {
  const [approved, setApproved] = useState(false);

  const handleClick = () => {
    if (approved) {
      goTo(VIEW_USER);
    } else {
      alert("Du måste godkänna villkoren för att fortsätta. Tryck på det röda krysset om du inte godkänner villkoren.");
    }
  };

  return (
    <div className="consent-overlay">

      <div className="consent-box">
        <p>
        Genom att delta och lämna dina svar samtycker du till att dina personuppgifter 
        behandlas för att möjliggöra matchning med relevanta nätverkskontakter. 
        Behandlingen sker i enlighet med gällande dataskyddslagstiftning.
        </p>

        <div className="checkbox-container">
          <input
            type="checkbox"
            checked={approved}
            onChange={(e) => setApproved(e.target.checked)}
          />
          <label>Jag godkänner villkoren</label>
        </div>

        <button onClick={handleClick}>Starta</button>
        <button className="close-button" onClick={() => goTo(VIEW_START)}>✖️</button>
      </div>
    </div>
  );
}
function User({ goTo, setEmail }) {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [localEmail, setLocalEmail] = useState(''); // Lokal state för mejladressen
  
    const isValidEmail = (email) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    };

    const handleContinue = async () => {
      if (!firstName || !localEmail) {
        alert("Fyll i förnamn och e-mail");
        return;
      }
      if (!isValidEmail(localEmail)) {
        alert("Ange en giltig e-postadress");
        return;
      }

      // Spara mejladressen i Home.jsx via setEmail
      setEmail(localEmail);

      // Skicka användarens namn och mejl till backend
      try {
        // Kontrollera om användaren redan har svarat på frågorna
        const checkResponse = await fetch(`http://localhost:5001/has-answered?userId=${encodeURIComponent(localEmail)}`);
        const checkData = await checkResponse.json();

        if (checkData.hasAnswered) {
            console.log("Användaren har redan svarat på frågorna. Skickar till matchningsresultat.");
            goTo(VIEW_RESULTS); // Skicka användaren direkt till matchningsresultat
            return;
        }
        
        const response = await fetch('http://localhost:5001/answers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: localEmail,
            firstName,
            lastName,
          }),
        });
        const responseData = await response.text();
        console.log('Svar från servern:', responseData);
      } catch (error) {
        console.error('Kunde inte skicka användaruppgifter:', error);
      }

      goTo(VIEW_QUESTIONS); 
    };

    return (
        <div className="user-info-form">
            <div>
            <h1>Personuppgifter</h1>
            <label>Förnamn</label>
            <input
                type="text"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                placeholder="Skriv ditt förnamn"
            />
            </div>

            <div>
            <label>Efternamn</label>
            <input
                type="text"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                placeholder="Skriv ditt efternamn"
            />
            </div>

            <div>
            <label>E-postadress</label>
            <input
                type="email"
                value={localEmail}
                onChange={e => setLocalEmail(e.target.value)}
                placeholder="mejl@example.com"
            />
            </div>

            <Button label="Gå vidare" onClick={handleContinue} />
        </div>
  );
}


export default Home;

import React, { useState } from 'react';
import Button from '../components/button';
import Questions from '../components/questions';
import MatchResults from '../components/match'; // Importera MatchResults

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
        {/*startsida*/}
        {view === VIEW_START && <StartPage goTo={setView} />}

        {/*samtyckessida*/}
        {view === VIEW_CONSENT && <Consent goTo={setView} />}

        {/*användaruppgifter*/}
        {view === VIEW_USER && <User goTo={setView} setEmail={setEmail}/>}

        {/*frågeformulär*/}
        {view === VIEW_QUESTIONS && <Questions goTo={setView} email={email} />}

        {/*matchningsresultat*/}
        {view === VIEW_RESULTS && <MatchResults goTo={setView} userId={email} refresh={() => setView(VIEW_RESULTS)} />}
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
      alert("Du måste godkänna villkoren");
    }
  };

  return (
    <div className="consent-overlay">
      <button className="close-button" onClick={() => goTo(VIEW_START)}>❌</button>

      <div className="consent-box">
        <p>
          Dina svar på frågorna inför eventet kommer att delas med andra deltagare
          i syfte att möjliggöra relevanta nätverkskopplingar. Genom att delta
          samtycker du till detta.
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

    const handleContinue = () => {
      if (!firstName || !localEmail) {
        alert("Fyll i alla fält");
        return;
      }
      if (!isValidEmail(localEmail)) {
        alert("Ange en giltig e-postadress");
        return;
      }

      // Spara mejladressen i Home.jsx via setEmail
      setEmail(localEmail);

    // Här kan du lagra användarinformation, t.ex. i localStorage eller en global state
    console.log("Användarinfo:", { firstName, lastName, email: localEmail });
    goTo(VIEW_QUESTIONS); 
    };

    return (
        <div className="user-info-form">
            <div>
            <h1>Uppgifter</h1>
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

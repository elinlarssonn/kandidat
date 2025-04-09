import React, { useState } from 'react';
import Button from '../components/button';
import Questions from '../components/questions';

const VIEW_START = 1;
const VIEW_CONSENT = 2;
const VIEW_QUESTIONS = 3;
const VIEW_SUBMITTED = 4;

function Home() {
    const [view, setView] = useState(VIEW_START);
  
    return (
      <div className="home-page">
        {}
        {view === VIEW_START && <StartPage goTo={setView} />}
        {}
        {view === VIEW_CONSENT && <Consent goTo={setView} />}
        {}
        {view === VIEW_QUESTIONS && <Questions goTo={setView} />}
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
      goTo(VIEW_QUESTIONS);
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

export default Home;

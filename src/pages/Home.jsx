import React, { useState } from 'react';
import Button from '../components/button';
import Questions from '../components/questions';
import MatchResults from '../components/match'; // Importera MatchResults
import Header from '../components/header'; 
import { useLanguage } from '../LanguageContext';


const VIEW_START = 1;
const VIEW_CONSENT = 2;
const VIEW_USER = 3;
const VIEW_QUESTIONS = 4;
const VIEW_RESULTS = 5; // Ny vy för matchningsresultat

function Home() {
    const { t } = useLanguage();
    const [view, setView] = useState(VIEW_START);
    const [email, setEmail] = useState(''); //state för att lagra mejl
  
    return (
      <div className="home-page">

        {view === VIEW_START && (
          <>
            <Header title={t("before-event")} />
            <StartPage goTo={setView} />
          </>
        )}

        {view === VIEW_CONSENT && (
          <>
            <Header title={t("consent")}  onBack={() => setView(VIEW_START)} />
            <Consent goTo={setView} />
          </>
        )}

        {view === VIEW_USER && (
          <>
            <Header title={t("personal-info")} onBack={() => setView(VIEW_CONSENT)} />
            <User goTo={setView} setEmail={setEmail} />
          </>
        )}

        {view === VIEW_QUESTIONS && (
          <>
            <Header title={t("question-about-you")} onBack={() => setView(VIEW_USER)} />
            <Questions goTo={setView} email={email} />
          </>
        )}

        {view === VIEW_RESULTS && (
          <>
            <Header title={t("user-matches")} onBack={() => setView(VIEW_QUESTIONS)} />
            <MatchResults goTo={setView} userId={email} refresh={() => setView(VIEW_RESULTS)} />
          </>
        )}

      </div>
    );
  }
  

function StartPage({ goTo }) {
  const { t, setLanguage } = useLanguage();
  return (
    <div className="start-content">
      <h1>{t("question-about-you")}</h1>
      <p>
        {t("answer-text")}
      </p>
      <Button label={t("start-button")} onClick={() => goTo(VIEW_CONSENT)} />
    </div>
  );
}


function Consent({ goTo }) {
  const { t } = useLanguage();
  const [approved, setApproved] = useState(false);

  const handleClick = () => {
    if (approved) {
      goTo(VIEW_USER);
    } else {
      alert(t("alert-consent"));;
    }
  };

  return (
    <div className="consent-overlay">

      <div className="consent-box">
        <p>
        {t("consent-info")}
        </p>

        <div className="checkbox-container">
          <input
            type="checkbox"
            checked={approved}
            onChange={(e) => setApproved(e.target.checked)}
          />
          <label>{t("approve-consent")}</label>
        </div>

        <button onClick={handleClick}>{t("start-button")}</button>
        <button className="close-button" onClick={() => goTo(VIEW_START)}>✖️</button>
      </div>
    </div>
  );
}
function User({ goTo, setEmail }) {
    const { t, setLanguage } = useLanguage();
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [localEmail, setLocalEmail] = useState(''); // Lokal state för mejladressen
  
    const isValidEmail = (email) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    };

    const handleContinue = async () => {
      if (!firstName || !localEmail) {
        alert(t("write-email"));
        return;
      }
      if (!isValidEmail(localEmail)) {
        alert(t("valid-email-alert"));
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
            <h1>{t("personal-info")}</h1>
            <label>{t("first-name")}</label>
            <input
                type="text"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                placeholder={t("write-first-name")}
            />
            </div>

            <div>
            <label>{t("last-name")}</label>
            <input
                type="text"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                placeholder={t("write-last-name")}
            />
            </div>

            <div>
            <label>{t("email")}</label>
            <input
                type="email"
                value={localEmail}
                onChange={e => setLocalEmail(e.target.value)}
                placeholder={t("example-emial")}
            />
            </div>

            <Button label={t("move-on")} onClick={handleContinue} />
        </div>
  );
}


export default Home;

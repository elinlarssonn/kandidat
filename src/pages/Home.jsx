import React, { useState } from 'react';
import Button from '../components/button';
import Questions from '../components/questions';
import MatchResults from '../components/match'; // Importera MatchResults
import Header from '../components/header'; 
import { useLanguage } from '../LanguageContext';


const VIEW_START = 2;
//const VIEW_CONSENT = 2;
const VIEW_USER = 1;
const VIEW_QUESTIONS = 3;
const VIEW_RESULTS = 4; // Ny vy för matchningsresultat

function Home() {
    const { t } = useLanguage();
    const [view, setView] = useState(VIEW_USER);
    const [email, setEmail] = useState(''); //state för att lagra mejl
  
    return (
      <div className="home-page">

        {view === VIEW_START && (
          <>
            <Header title={t("before-event")} />
            <StartPage goTo={setView} />
          </>
        )}


        {view === VIEW_USER && (
          <>
            <Header title={t("personal-info")} onBack={() => setView(VIEW_START)} />
            <User goTo={setView} setEmail={setEmail} />
          </>
        )}

        {view === VIEW_QUESTIONS && (
          <>
            <Header title={t("question-about-you")} onBack={() => setView(VIEW_RESULTS)} />
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
      <Button label={t("start-button")} onClick={() => goTo(VIEW_QUESTIONS)} />
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
    const [localEmail, setLocalEmail] = useState(''); // Lokal state för mejladressen
    const [errorMessage, setErrorMessage] = useState("");

    const isValidEmail = (email) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    };

    const handleContinue = async () => {
        if (!localEmail) {
            setErrorMessage(t("write-email"));
            return;
        }
        if (!isValidEmail(localEmail)) {
            setErrorMessage(t("valid-email-alert"));
            return;
        }

        try {
            const checkResponse = await fetch(`http://localhost:5001/has-answered?userId=${encodeURIComponent(localEmail)}`);
            const checkData = await checkResponse.json();

            if (!checkData.exists) {
                setErrorMessage(t("email-not-exist")); // Visar felmeddelande om mejlen inte existerar
                return;
            }

            if (checkData.hasAnswered) {
                console.log("Användaren har redan svarat på frågorna. Skickar till matchningsresultat.");
                setEmail(localEmail); // Spara mejladressen
                goTo(VIEW_RESULTS); // Skicka användaren till matchningssidan
                return;
            }

            console.log("Användaren har inte svarat på frågorna. Skickar till frågorna.");
            setEmail(localEmail); // Spara mejladressen
            goTo(VIEW_QUESTIONS); // Skicka användaren till frågorna
        } catch (error) {
            console.error('Kunde inte verifiera användarens e-postadress:', error);
            setErrorMessage(t("error-message"));
        }
    };

    return (
        <div className="user-info-form">
            <div>
                <label>{t("email")}</label>
                <input
                    type="email"
                    value={localEmail}
                    onChange={(e) => {
                        setLocalEmail(e.target.value);
                        setErrorMessage("");
                    }}
                    placeholder={t("example-email")}
                />
                {errorMessage && <p className="error-message">{errorMessage}</p>}
            </div>
            <Button label={t("move-on")} onClick={handleContinue} />
        </div>
    );
}


export default Home;

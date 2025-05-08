import React, { useState } from 'react';
import Button from '../components/button';
import { useLanguage } from '../LanguageContext';



function MatchResults({ goTo, userId }) {
    const [results, setResults] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null); // För att hantera popup för information
    const { t } = useLanguage();
    

    React.useEffect(() => {
        fetchResults();
    }, [userId]);

    const fetchResults = () => {
        // Hämta matchningsresultat från backend med userId
        fetch(`http://localhost:5001/match-all?userId=${encodeURIComponent(userId)}`)
            .then(response => response.json())
            .then(data => setResults(data))
            .catch(error => console.error('Fel vid hämtning av matchningsresultat:', error));
    };

    const openInfoPopup = (user) => {
        console.log(user);
        setSelectedUser({
            firstName: user.firstName,
            lastName: user.lastName,
            userId: user.userId, // Kontrollera att detta är rätt fält för mejl
        });
    };

    const closeInfoPopup = () => {
        setSelectedUser(null); // Stäng popup
    };

    const openChat = (userId) => {
        // Här kan du länka till en chattfunktion, t.ex. en ny sida eller modal
        console.log(`Öppnar chatt med ${userId}`);
        alert(`${t("alert-chat-one")} ${userId}. ${t("alert-chat-two")}`);
    };

    // Hämta användarens namn från resultaten
    const userName = results.length > 0 ? `${results[0].userA.firstName}` : "dig";

    return (
        <div className="match-results">
            <h1>{t("match-result")} {userName}</h1>
            <ul>
                {results.map((result, index) => (
                    <li key={index} className="match-item">
                        {t("your-matches")}{result.userB.firstName} {result.userB.lastName} {t("with")} {result.matchScore} {t("points")}
                        <button className="info-button" onClick={() => openInfoPopup(result.userB)}>
                            ℹ️
                        </button>
                        <button className="chat-button" onClick={() => openChat(result.userB.userId)}>
                            💬
                        </button>
                    </li>
                ))}
            </ul>
            <Button label="Uppdatera matchningar" onClick={fetchResults} />

            {/* Popup för information */}
            {console.log("Selected User State:", selectedUser)}
            {selectedUser && (
                <div className="info-popup">
                    <div className="info-popup-content">
                        <h2>{t("info-about")} {selectedUser.firstName} {selectedUser.lastName}</h2>
                        <p><strong>{t("email")}:</strong> {selectedUser.userId}</p>
                        <p><strong>{t("name")}:</strong> {selectedUser.firstName} {selectedUser.lastName}</p>
                        <button onClick={closeInfoPopup}>{t("close-button")}</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default MatchResults;
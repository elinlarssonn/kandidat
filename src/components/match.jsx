import React, { useState } from 'react';
import Button from '../components/button';

function MatchResults({ goTo, userId }) {
    const [results, setResults] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null); // För att hantera popup för information

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
        setSelectedUser(user); // Sätt användaren som ska visas i popup
    };

    const closeInfoPopup = () => {
        setSelectedUser(null); // Stäng popup
    };

    const openChat = (userId) => {
        // Här kan du länka till en chattfunktion, t.ex. en ny sida eller modal
        console.log(`Öppnar chatt med ${userId}`);
        alert(`Chatt med ${userId} öppnas (implementera chattfunktion här).`);
    };

    // Hämta användarens namn från resultaten
    const userName = results.length > 0 ? `${results[0].userA.firstName}` : "Användaren";

    return (
        <div className="match-results">
            <h1>Matchningsresultat för {userName}</h1>
            <ul>
                {results.map((result, index) => (
                    <li key={index} className="match-item">
                        Du har matchat med {result.userB.firstName} {result.userB.lastName} med {result.matchScore} poäng
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
            {selectedUser && (
                <div className="info-popup">
                    <div className="info-popup-content">
                        <h2>Information om {selectedUser.firstName} {selectedUser.lastName}</h2>
                        <p><strong>Mejl:</strong> {selectedUser.userId}</p>
                        <p><strong>Namn:</strong> {selectedUser.firstName} {selectedUser.lastName}</p>
                        <button onClick={closeInfoPopup}>Stäng</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default MatchResults;
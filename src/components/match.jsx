import React, { useState } from 'react';
import Button from '../components/button';


function MatchResults({ goTo, userId }) {
    const [results, setResults] = useState([]);

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

    return (
        <div className="match-results">
            <h1>Matchningsresultat</h1>
            <ul>
                {results.map((result, index) => (
                    <li key={index}>
                        Person {result.userA} matchar med Person {result.userB} med poäng: {result.matchScore}
                    </li>
                ))}
            </ul>
            <Button label="Uppdatera matchningar" onClick={fetchResults} />
        </div>
    );
}

export default MatchResults;
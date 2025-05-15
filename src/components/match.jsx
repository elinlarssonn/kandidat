import React, { useState } from 'react';
import Button from '../components/button';
import { useLanguage } from '../LanguageContext';



function MatchResults({ goTo, userId }) {
    const [results, setResults] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null); // För att hantera popup för information
    const { t } = useLanguage();
    const [extraResults, setExtraResults] = useState([]); // För fler matchningar
    const [showingMore, setShowingMore] = useState(false); // Om fler matchningar visas 
    const [showWeak, setShowWeak] = useState(false);
    const [noMatches, setNoMatches] = useState(false);


    

    React.useEffect(() => {
        fetchResults();
    }, [userId]);

    const fetchResults = () => {
        // Hämta matchningsresultat från backend med userId
        fetch(`http://localhost:5001/match-all?userId=${encodeURIComponent(userId)}`)
            .then(response => response.json())
            .then(data => {
                const nonZeroMatches = data.filter(match => match.matchScore > 0);
                setResults(nonZeroMatches);
                setShowingMore(false); // Återställ när man uppdaterar
                setExtraResults([]);

                const allScoresAreZero = nonZeroMatches.length === 0;
                setNoMatches(allScoresAreZero);
            })
            .catch(error => console.error('Fel vid hämtning av matchningsresultat:', error));
    };
    const fetchMoreResults = () => {
        fetch(`http://localhost:5001/match-rest?userId=${encodeURIComponent(userId)}`)
            .then(response => response.json())
            .then(data => {
                setExtraResults(data);
                setShowingMore(true);
            })
            .catch(error => console.error('Fel vid hämtning av extra matchningar:', error));
    };

    const toggleShowMore = () => {
        if (!showingMore && extraResults.length === 0) {
            fetchMoreResults(); // Endast första gången
        }
        setShowingMore(!showingMore);
    };    

    const toggleShowWeak = () => {
        setShowWeak(!showWeak);
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
            <h1>{t("match-result")}</h1>
            
            {noMatches && (
                <p className="no-matches-message">
                    {t("no-matches-message")}
                </p>
            )}
            
            {results.length > 0 && (
                <>
            <h2 className="match-section-title"> {t("top-matches")} </h2>
            <ul className="match-group top-matches">
                {results.map((result, index) => (
                    <li key={index} className="match-item">
                        <span>
                            {result.userB.firstName} {result.userB.lastName}
                        </span>
                        <button className="info-button" onClick={() => openInfoPopup(result.userB)}>
                            <img src= '/icons/info-svgrepo-com.svg' alt="Info" className="icon-image" />
                        </button>
                        <button className="chat-button" onClick={() => openChat(result.userB.userId)}>
                            <img src="/icons/chat-round-dots-svgrepo-com.svg" alt="Chat" className="icon-image" />
                        </button>
                    </li>
                ))}
            </ul>
            </>
            )}
            {/* Visa/Göm fler */}
            {results.length > 0 && (
                <div className="button-in-matching">
                    <button className="load-more-button" onClick={toggleShowMore}>
                        {showingMore ? t("hide-more-matches") : t("show-more-matches")}
                    </button>
                </div>
            )}
            {showingMore && (
                <>
                {/* Starka matchningar */}
                {extraResults.strongMatches?.length > 0 && (
                    <>
                    <h2 className="match-section-title">{t("more-strong-matches")}</h2>
                        <ul className="match-group strong-matches">
                            {extraResults.strongMatches.map((result, index) => (
                                <li key={`strong-${index}`} className="match-item">
                                    <span>
                                    {result.userB.firstName} {result.userB.lastName} 
                                    </span>
                                    <button className="info-button" onClick={() => openInfoPopup(result.userB)}>
                                        <img src="/icons/info-svgrepo-com.svg" alt="Info" className="icon-image" />
                                    </button>
                                    <button className="chat-button" onClick={() => openChat(result.userB.userId)}>
                                        <img src="/icons/chat-round-dots-svgrepo-com.svg" alt="Chat" className="icon-image" />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </>
                )}
                
                {/* Medelmatchningar */}
                {extraResults.mediumMatches?.length > 0 && (
                    <>
                    <h2 className="match-section-title">{t("weaker-matches")}</h2>
                        <ul className="match-group medium-matches">
                            {extraResults.mediumMatches.map((result, index) => (
                                <li key={`medium-${index}`} className="match-item">
                                    <span>
                                    {result.userB.firstName} {result.userB.lastName}
                                    </span>
                                    <button className="info-button" onClick={() => openInfoPopup(result.userB)}>
                                        <img src="/icons/info-svgrepo-com.svg" alt="Info" className="icon-image" />
                                    </button>
                                    <button className="chat-button" onClick={() => openChat(result.userB.userId)}>
                                        <img src="/icons/chat-round-dots-svgrepo-com.svg" alt="Chat" className="icon-image" />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </>
                )}

                {/* Visa/Göm fler */}
                {results.length > 0 && (
                    <div className="more-button-in-matching">
                        <button className="load-more-button" onClick={toggleShowWeak}>
                            {showWeak ? t("hide-weak-matches") : t("weak-matches-button")}
                        </button>
                    </div>
                )}
    
                {/* Svaga matchningar */}
                {showWeak && extraResults.weakMatches?.length > 0 && (
                    <>
                    <h2 className="match-section-title">{t("weak-matches")}</h2>
                        <ul className="match-group weak-matches">
                            {extraResults.weakMatches.map((result, index) => (
                                <li key={`weak-${index}`} className="match-item">
                                    <span>
                                    {result.userB.firstName} {result.userB.lastName} 
                                    </span>
                                    <button className="info-button" onClick={() => openInfoPopup(result.userB)}>
                                        <img src="/icons/info-svgrepo-com.svg" alt="Info" className="icon-image" />
                                    </button>
                                    <button className="chat-button" onClick={() => openChat(result.userB.userId)}>
                                        <img src="/icons/chat-round-dots-svgrepo-com.svg" alt="Chat" className="icon-image" />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </>
                )}
            </>
            )} 

            <Button label={t("update-matches")} onClick={fetchResults} />

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
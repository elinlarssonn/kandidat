import React, { useState } from 'react';
import Button from '../components/button';

function Home (){
    const [view, setView] = useState(1)
    return (
        <div>
            {view === 1 && <StartPage goTo={setView} />}
            {view === 2 && <Consent goTo={setView} />}
            {view === 3 && <Questions goTo={setView} />}
        </div>
    )
};

function StartPage({goTo}){
    return (
        <div className="home-page">
            <h1>Frågor om dig</h1>
            <p>Svara gärna på några snabba frågor - det hjälper oss att matcha dig med relevanta kontakter under eventet.</p>
            <Button label = "Starta" onClick={()=> goTo(2)}/>
        </div>
    );
}

function Consent({goTo}){
    return (
        <div className="consent-page">
            <h1>Samtycke</h1>
            <p>Genom att delta i detta event godkänner du att vi lagrar och använder dina uppgifter för att matcha dig med relevanta kontakter.</p>
            <Button label = "Godkänn" onClick={()=> goTo(3)}/>
        </div>
    );
}

function Questions({goTo}){
    return (
        <div className="questions-page">
            <h1>Frågor</h1>
            <p>Här är några frågor som vi vill att du ska svara på.</p>
            <Button label = "Skicka in" onClick={()=> goTo(4)}/>
        </div>
    );
}


export default Home;


import React, { useState } from 'react';
import Button from '../components/button';
import questions from '../data/questions.json';

function Questions({ goTo }) {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    
    const handleAnswer = (questionId, option) => {
        setAnswers(prev => {
            const currentAnswers = prev[questionId] || []; // Hämta befintliga svar för frågan
            if (currentAnswers.includes(option)) {
                // Om alternativet redan är valt, ta bort det
                return {
                    ...prev,
                    [questionId]: currentAnswers.filter(answer => answer !== option),
                };
            } else if (currentAnswers.length < 3) {
                // Lägg till alternativet om färre än 3 är valda
                return {
                    ...prev,
                    [questionId]: [...currentAnswers, option],
                };
            } else {
                // Om maxgränsen är nådd, ignorera valet
                return prev;
            }
        });
    };

    const nextQuestion = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1); 
        } else {
            submitAnswers(); 
        }
    };

    const submitAnswers = () => {
        console.log("Användarens svar:", answers); 
        goTo(4); 
    };

    const currentQuestion = questions[currentQuestionIndex];

  
    return (
        <div className="questions-page">
            <h1>Frågor</h1>
            <div className="question">
                <p>{currentQuestion.question}</p>
                {currentQuestion.options.map(option => (
            <div key={option} className="option">
                <input
                    type="checkbox"
                    id={`${currentQuestion.id}-${option}`}
                    checked={answers[currentQuestion.id]?.includes(option) || false}
                    onChange={() => handleAnswer(currentQuestion.id, option)}
                />
                <label htmlFor={`${currentQuestion.id}-${option}`}>{option}</label>
            </div>
        ))}
                
                
            </div>
            <Button
                label={currentQuestionIndex < questions.length - 1 ? "Nästa fråga" : "Skicka in"}
                onClick={nextQuestion}
            />
        </div>
        
  );
}

export default Questions;
import React, { useState } from 'react';
import Button from '../components/button';
import Dropdown from 'react-bootstrap/Dropdown';
import questions from '../data/questions.json';

function Questions({ goTo, email }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});

  const handleAnswer = (questionId, option) => {
    setAnswers(prev => {
      const currentAnswers = prev[questionId] || [];
      if (currentAnswers.includes(option)) {
        return {
          ...prev,
          [questionId]: currentAnswers.filter(answer => answer !== option),
        };
      } else if (currentAnswers.length < 3) {
        return {
          ...prev,
          [questionId]: [...currentAnswers, option],
        };
      } else {
        return prev;
      }
    });
  };

  const handleSingleCheckbox = (questionId, option) => {
    setAnswers(prev => ({
        ...prev,
        [questionId]: [option], // Spara endast det valda alternativet som en array
    }));
  };

  const handleDropdownChange = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleRadioChange = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < remainingQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      submitAnswers();
    }
  };

  const submitAnswers = async () => {
    console.log("submitAnswers körs");
    console.log("Svar som skickas:", answers);
    if (!email) {
      alert('Du måste ange en mejladress först');
      return;
    }
    console.log("Mejladress som skickas som userId:", email);
    console.log('Skickar följande svar till backend:', answers);
    try {
        const response = await fetch('http://localhost:5001/answers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: email, answers }),
        });
        const responseData = await response.text();
        console.log('Svar från servern:', responseData);
        goTo(5); // Gå till nästa vy
    } catch (error) {
        console.error('Kunde inte skicka svar:', error);
    }
};

  // Första tre frågor
  const firstThreeQuestions = questions.slice(0, 2);
  const remainingQuestions = questions.slice(3);
  const mentorQuestion = questions.find(q => q.id === 3); // Hämta mentorfrågan från JSON
  const currentQuestion = currentQuestionIndex > 0 ? remainingQuestions[currentQuestionIndex - 1] : null;

  return (
    <div className="questions-page">
      <h1>Frågor</h1>

      {currentQuestionIndex === 0 ? (
        <div className="first-three">
          {firstThreeQuestions.map(q => (
            <div key={q.id} className="question-block">
              <label>{q.question}</label>
              {q.id === 2 ? (
                <select
                  value={answers[q.id] || ''}
                  onChange={e => handleDropdownChange(q.id, e.target.value)}
                >
                  <option value="" disabled>Välj ett alternativ</option>
                  {q.options.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              ) : q.options.length <= 2 ? (
                <div className="radio-group">
                  {q.options.map(option => (
                    <label key={option}>
                      <input
                        type="radio"
                        name={`radio-${q.id}`}
                        value={option}
                        checked={answers[q.id] === option}
                        onChange={() => handleRadioChange(q.id, option)}
                      />
                      {option}
                    </label>
                  ))}
                </div>
              ) : (
                <select
                  value={answers[q.id] || ''}
                  onChange={e => handleDropdownChange(q.id, e.target.value)}
                >
                  <option value="">Välj</option>
                  {q.options.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              )}
            </div>
          ))}

          {/* Visa mentorfrågan om erfarenhetsfrågan har ett specifikt svar */}
          {(answers[2] === "3-5 år" || answers[2] === "5-10 år" || answers[2] === "10+ år") && mentorQuestion && (
            <div className="question-block">
              <label>{mentorQuestion.question}</label>
              <div className="radio-group">
                {mentorQuestion.options.map(option => (
                  <label key={option}>
                    <input
                      type="radio"
                      name={`radio-${mentorQuestion.id}`}
                      value={option}
                      checked={answers[mentorQuestion.id] === option}
                      onChange={() => handleRadioChange(mentorQuestion.id, option)}
                    />
                    {option}
                  </label>
                ))}
              </div>
            </div>
          )}

          <Button label="Nästa fråga" onClick={() => setCurrentQuestionIndex(1)} />
        </div>
      ) : (
        
        <div className="question">
          {currentQuestion && <p>{currentQuestion.question}</p>}
          {currentQuestion && currentQuestion.id === 6 ? (
            // Fråga 6: Endast en checkbox kan väljas
            currentQuestion.options.map(option => (
                <div key={option} className="option">
                    <input
                        type="checkbox"
                        id={`${currentQuestion.id}-${option}`}
                        checked={answers[currentQuestion.id]?.includes(option) || false}
                        onChange={() => handleSingleCheckbox(currentQuestion.id, option)}
                    />
                    <label htmlFor={`${currentQuestion.id}-${option}`}>{option}</label>
                </div>
            ))
          ) : currentQuestion && currentQuestion.id === 7 ? (
            // Fråga 7: Max tre checkboxar kan väljas
            currentQuestion.options.map(option => (
                <div key={option} className="option">
                    <input
                        type="checkbox"
                        id={`${currentQuestion.id}-${option}`}
                        checked={answers[currentQuestion.id]?.includes(option) || false}
                        onChange={() => handleAnswer(currentQuestion.id, option)}
                    />
                    <label htmlFor={`${currentQuestion.id}-${option}`}>{option}</label>
                </div>
            ))
          ) : (
            currentQuestion && currentQuestion.options.map(option => (
              <div key={option} className="option">
                <input
                  type="checkbox"
                  id={`${currentQuestion.id}-${option}`}
                  checked={answers[currentQuestion.id]?.includes(option) || false}
                  onChange={() => handleAnswer(currentQuestion.id, option)}
                />
                <label htmlFor={`${currentQuestion.id}-${option}`}>{option}</label>
              </div>
            ))
          )}
          <Button
            label={currentQuestionIndex < remainingQuestions.length - 1 ? "Nästa fråga" : "Skicka in"}
            onClick={nextQuestion}
          />
        </div>
      )}
    </div>
  );
}

export default Questions;

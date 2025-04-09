import React, { useState } from 'react';
import Button from '../components/button';
import Dropdown from 'react-bootstrap/Dropdown';
import questions from '../data/questions.json';

function Questions({ goTo }) {
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
    if (currentQuestionIndex < questions.length - 3) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      submitAnswers();
    }
  };

  const submitAnswers = () => {
    console.log("Användarens svar:", answers);
    goTo(5); // skickar vidare till "submitted"
  };

  // Första tre frågor
  const firstThreeQuestions = questions.slice(0, 3);
  const remainingQuestions = questions.slice(3);
  const currentQuestion = remainingQuestions[currentQuestionIndex];

  return (
    <div className="questions-page">
      <h1>Frågor</h1>

      {currentQuestionIndex === 0 ? (
        <div className="first-three">
          {firstThreeQuestions.map(q => (
            <div key={q.id} className="question-block">
              <label>{q.question}</label>
              {q.options.length <= 2 ? (
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
          <Button label="Nästa fråga" onClick={() => setCurrentQuestionIndex(1)} />
        </div>
      ) : (
        <div className="question">
          <p>{currentQuestion.question}</p>
          {currentQuestion.type === "dropdown" ? (
            <Dropdown>
              <Dropdown.Toggle variant="success" id={`dropdown-${currentQuestion.id}`}>
                {answers[currentQuestion.id]?.[0] || "Välj dett alternativ"}
              </Dropdown.Toggle>

              <Dropdown.Menu>
                {currentQuestion.options.map(option => (
                  <Dropdown.Item
                    key={option}
                    onClick={() => handleDropdownChange(currentQuestion.id, option)}
                  >
                    {option}
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
          ) : (
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
          )}
          <Button
            label={currentQuestionIndex < remainingQuestions.length ? "Nästa fråga" : "Skicka in"}
            onClick={nextQuestion}
          />
        </div>
      )}
    </div>
  );
}

export default Questions;

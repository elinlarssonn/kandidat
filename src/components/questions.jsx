import React, { useState } from 'react';
import Button from '../components/button';
import Dropdown from 'react-bootstrap/Dropdown';
import questions from '../data/questions_sv.json';
import { useLanguage } from '../LanguageContext';
import sv from '../data/swe.json';
import en from '../data/en.json';

function Questions({ goTo, email }) {
  const { t, language } = useLanguage(); 

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const translations = {
    sv: sv,
    en: en
  };

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
      [questionId]: [option],
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
    if (currentQuestionIndex <= remainingQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      submitAnswers();
    }
  };

  const submitAnswers = async () => {
    if (!email) {
      alert(t("write-email"));
      return;
    }

    try {
      const response = await fetch('http://localhost:5001/answers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: email, answers }),
      });
      await response.text();
      goTo(4);
    } catch (error) {
      console.error('Kunde inte skicka svar:', error);
    }
  };

  const firstThreeQuestions = questions.slice(0, 2);
  const remainingQuestions = questions.slice(3);
  const mentorQuestion = questions.find(q => q.id === 3);
  const currentQuestion = currentQuestionIndex > 0 ? remainingQuestions[currentQuestionIndex - 1] : null;

  return (
    <div className="questions-page">
      <div className="question-progress">
        <QuestionProgressCircleRow
          questions={firstThreeQuestions}
          active={currentQuestionIndex === 0}
          answered={firstThreeQuestions.some(q => answers[q.id] !== undefined)}
          onClick={() => setCurrentQuestionIndex(0)}
          index={1}
        />
        
        {remainingQuestions.map((question, i) => (
        <QuestionProgressCircleRow
          key={question.id}
          questions={[question]}
          active={currentQuestionIndex === i + 1}
          answered={answers[question.id] !== undefined}
          onClick={() => setCurrentQuestionIndex(i + 1)}
          index={i + 2}
        />
        ))}
      </div>
      
      
      <h1>{t("fill-in-answers")}</h1>

      {currentQuestionIndex === 0 ? (
        <div className="first-three">
          {firstThreeQuestions.map(q => (
            <div key={q.id} className="question-block">
              <label>{t(q.question)}</label>

              {q.id === 1 & 2 ? (
                <select
                  value={answers[q.id] || ''}
                  onChange={e => handleDropdownChange(q.id, e.target.value)}
                >
                  <option value="" disabled>{t("choose-option")}</option>
                  {q.options.map(option => (
                    <option key={option} value={option}>{t(option)}</option>
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
                      {t(option)}
                    </label>
                  ))}
                </div>
              ) : (
                <Dropdown>
                  <Dropdown.Toggle variant="success" id="dropdown-basic">
                  {answers[q.id] ? t(answers[q.id]) :  t("choose-option")}
                  </Dropdown.Toggle>
                  <Dropdown.Menu align="start">
                    {q.options.map(option => (
                      <Dropdown.Item
                        key={option}
                        onClick={() => handleDropdownChange(q.id, option)}
                      >
                        {t(option)}
                      </Dropdown.Item>
                    ))}
                  </Dropdown.Menu>
                </Dropdown>
              )}
            </div>
          ))}

          {(answers[2] === "exp-3-5" || answers[2] === "exp-5-10" || answers[2] === "exp-10plus") && mentorQuestion && (
            <div className="question-block">
              <label>{t(mentorQuestion.question)}</label>
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
                    {t(option)}
                  </label>
                ))}
              </div>
            </div>
          )}

          <Button label={t("next-question")} onClick={() => setCurrentQuestionIndex(1)} />
        </div>
      ) : (
        <div className="question">
<div className="question-text">
  {currentQuestion && <p>{t(currentQuestion.question)}</p>}
</div>

<div className="answer-options">
  <div className="options-grid">
    {currentQuestion && currentQuestion.options.map(option => (
      <div key={option} className="option">
        <input
          type="checkbox"
          id={`${currentQuestion.id}-${option}`}
          checked={answers[currentQuestion.id]?.includes(option) || false}
          onChange={() =>
            currentQuestion.id === 6
              ? handleSingleCheckbox(currentQuestion.id, option)
              : handleAnswer(currentQuestion.id, option)
          }
        />
        <label htmlFor={`${currentQuestion.id}-${option}`}>{t(option)}</label>
      </div>
    ))}
  </div>
</div>

  {}
    {currentQuestionIndex === remainingQuestions.length && (
      <p className="consent-link-text">
        {t("read-more-gdpr")}{" "}
        <span
          className="consent-link"
          onClick={() => goTo(5)}
        >
        {t("read-more-here")}
        </span>
      </p>
    )}

          <Button
            label={currentQuestionIndex <= remainingQuestions.length - 1 ? t("next-question") : t("submit")}
            onClick={nextQuestion}
          />
        </div>
      )}
    </div>
  );
}

function QuestionProgressCircleRow({ questions, active, answered, onClick, index }) {
  return (
    <button
      className={`step-circle ${active ? "current" : ""} ${answered ? "answered" : ""}`}
      onClick={onClick}
    >
      {answered ? "✓" : index}
    </button>
  );
}

function QuestionProgress({remainingQuestions, current, answers, onNavigate }) {
  const totalSteps = 1 + remainingQuestions.length; // första sidan + resten

  return (
    <div className="question-progress">
      {remainingQuestions.map((question, index) => {
        const isAnswered = answers[question.id];
        const isCurrent = index === current;

        return (
          <button
            key={index}
            className={`step-circle ${isCurrent ? "current" : ""} ${isAnswered ? "answered" : ""}`}
            onClick={() => onNavigate(index)}
          >
            {isAnswered ? "✓" : index + 1}
          </button>
        );
      })}
    </div>
  );
}


export default Questions;

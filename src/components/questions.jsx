import React, { useState, useEffect } from 'react';
import Button from '../components/button';
import Dropdown from 'react-bootstrap/Dropdown';
import questions from '../data/questions_sv.json';
import { useLanguage } from '../LanguageContext';
import sv from '../data/swe.json';
import en from '../data/en.json';

function Questions({ goTo, email }) {
  const { t, language } = useLanguage();

  // Ladda index från sessionStorage (för att gå till rätt fråga efter Consent)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(() => {
    const savedIndex = sessionStorage.getItem('returnToQuestionIndex');
    if (savedIndex) {
      sessionStorage.removeItem('returnToQuestionIndex');
      return parseInt(savedIndex, 10);
    }
    return 0;
  });

  // Ladda tidigare svar från sessionStorage
  const [answers, setAnswers] = useState(() => {
    const saved = sessionStorage.getItem('savedAnswers');
    return saved ? JSON.parse(saved) : {};
  });

  const [consentApproved, setConsentApproved] = useState(false);
  const translations = { sv, en };

  // Spara svar i sessionStorage vid varje ändring
  useEffect(() => {
    sessionStorage.setItem('savedAnswers', JSON.stringify(answers));
  }, [answers]);

  const handleAnswer = (questionId, option) => {
    setAnswers(prev => {
      const currentAnswers = prev[questionId] || [];

      if (questionId === 4) {
        const isGoalNone = option === "goal-none";

        if (isGoalNone) {
          if (currentAnswers.includes("goal-none")) {
            return {
              ...prev,
              [questionId]: [],
            };
          } else {
            return {
              ...prev,
              [questionId]: ["goal-none"],
            };
          }
        } else {
          let updated = currentAnswers.filter(ans => ans !== "goal-none");

          if (updated.includes(option)) {
            updated = updated.filter(ans => ans !== option);
          } else if (updated.length < 3) {
            updated = [...updated, option];
          }

          return {
            ...prev,
            [questionId]: updated,
          };
        }
      }

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
                    {answers[q.id] ? t(answers[q.id]) : t("choose-option")}
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
              {currentQuestion && currentQuestion.options.map(option => {
                const isDisabled =
                  currentQuestion.id === 4 &&
                  answers[4]?.includes("goal-none") &&
                  option !== "goal-none";

                return (
                  <div key={option} className="option">
                    {currentQuestion.id === 6 ? (
                      <>
                        <input
                          type="radio"
                          id={`${currentQuestion.id}-${option}`}
                          name={`radio-${currentQuestion.id}`}
                          value={option}
                          checked={answers[currentQuestion.id]?.includes(option) || false}
                          onChange={() => handleSingleCheckbox(currentQuestion.id, option)}
                        />
                        <label htmlFor={`${currentQuestion.id}-${option}`}>{t(option)}</label>
                      </>
                    ) : (
                      <>
                        <input
                          type="checkbox"
                          id={`${currentQuestion.id}-${option}`}
                          checked={answers[currentQuestion.id]?.includes(option) || false}
                          onChange={() => handleAnswer(currentQuestion.id, option)}
                          disabled={isDisabled}
                        />
                        <label htmlFor={`${currentQuestion.id}-${option}`}>{t(option)}</label>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {currentQuestionIndex === remainingQuestions.length && (
            <div className="consent-section">
              <p className="consent-link-text">
                {t("read-more-gdpr")}{" "}
                <span
                  className="consent-link"
                  onClick={() => goTo(5)}
                >
                  {t("read-more-here")}
                </span>
              </p>
              <div className="checkbox-container">
                <input
                  type="checkbox"
                  id="consent-approved"
                  checked={consentApproved}
                  onChange={() => setConsentApproved(!consentApproved)}
                />
                <label htmlFor="consent-approved">{t("approve-consent")}</label>
              </div>
            </div>
          )}

          <Button
            label={currentQuestionIndex <= remainingQuestions.length - 1 ? t("next-question") : t("submit")}
            onClick={nextQuestion}
            disabled={!consentApproved && currentQuestionIndex === remainingQuestions.length}
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

export default Questions;

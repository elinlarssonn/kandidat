import React from 'react';
import { useLanguage } from '../LanguageContext';


function Header({ title, onBack }) {
  const { t, setLanguage, language } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'sv' ? 'en' : 'sv'); // Växla mellan svenska och engelska
  };

  return (
    <div className="page-header">
      {onBack && (
        <button className="header-back-button" onClick={onBack}>
        ← {t("back")}
        </button>
      )}
      <h2 className="header-title">{title}</h2>

      <div className="language-flags">
      <button onClick={toggleLanguage} className="language-button">
          <img
            src={language === 'sv' ? '/icons/flag-gb-svgrepo-com.svg' : '/icons/flag-se-svgrepo-com.svg'}
            alt={language === 'sv' ? 'English flag' : 'Swedish flag'}
            className="language-flag"
          />
        </button>
      </div>
    </div>
  );
}

export default Header;

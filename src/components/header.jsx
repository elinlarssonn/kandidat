import React from 'react';
import { useLanguage } from '../LanguageContext';


function Header({ title, onBack }) {
  const { t, setLanguage, language } = useLanguage();
  return (
    <div className="page-header">
      {onBack && (
        <button className="header-back-button" onClick={onBack}>
        ← Tillbaka
        </button>
      )}
      <h2 className="header-title">{title}</h2>

      <div className="language-flags">
        <button onClick={() => setLanguage('sv')} className={language === 'sv' ? 'active' : ''}>🇸🇪</button>
        <button onClick={() => setLanguage('en')} className={language === 'en' ? 'active' : ''}>🇬🇧</button>
      </div>
    </div>
  );
}

export default Header;

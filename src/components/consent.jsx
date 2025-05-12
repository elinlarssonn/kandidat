import React from 'react';
import { useLanguage } from '../LanguageContext';

function Consent({ goTo }) {
  const { t } = useLanguage();

  return (
    <div className="consent-page">
      <h1>{t("gdpr-title")}</h1>
      <p>{t("gdpr-info")}</p>
      <button> onClick={() => goTo(3)}</button>
    </div>
  );
}

export default Consent;
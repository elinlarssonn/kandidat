import React from 'react';

function Header({ title, onBack }) {
  return (
    <div className="page-header">
      {onBack && (
        <button className="header-back-button" onClick={onBack}>
        ← Tillbaka
        </button>
      )}
      <h2 className="header-title">{title}</h2>
    </div>
  );
}

export default Header;

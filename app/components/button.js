import React from 'react';

const Button = ({ onClick, children, isSelected }) => {
  return (
    <button
      onClick={onClick}
      className={`btn ${isSelected ? 'btn-selected' : ''}`}
    >
      {children}
    </button>
  );
};

export default Button;


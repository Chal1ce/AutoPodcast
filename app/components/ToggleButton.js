import React from 'react';
import Button from './button';

const ToggleButton = ({ options, selectedOption, onSelect }) => {
  return (
    <div className="flex space-x-2">
      {options.map((option) => (
        <Button
          key={option.value}
          onClick={() => onSelect(option.value)}
          isSelected={selectedOption === option.value}
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
};

export default ToggleButton;

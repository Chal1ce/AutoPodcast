import React, { useState, useRef, useEffect } from 'react';

const ToggleButton = ({ selectedOption, onSelect, options }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleSelect = (option) => {
    onSelect(option.value);
    setIsOpen(false);
  };

  const selectedLabel = options.find(opt => opt.value === selectedOption)?.label || selectedOption;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="px-4 py-2 bg-blue-500 text-white rounded-md focus:outline-none text-sm h-[38px] w-[150px] text-left"
      >
        {selectedLabel} ▼
      </button>
      {isOpen && (
        <ul className="absolute right-0 mt-2 py-2 w-[150px] bg-white rounded-md shadow-xl z-20 text-sm">
          {options.map((option) => (
            <li
              key={option.value}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleSelect(option)}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ToggleButton;

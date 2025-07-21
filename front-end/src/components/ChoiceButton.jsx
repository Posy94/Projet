import React from "react";
import PropTypes from 'prop-types';

const ChoiceButton = ({ label, onClick, selected = false, disabled = false }) => {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`
                w-full px-4 py-2 rounded-x1 border transition-all duration-200 text-lg font-medium
                ${selected ? 'bg-blue-600 text-white' : 'bg-white text-gray-800 hover:bg-blue-100'}
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-ponter'}
           `}
        >
            {label}
        </button>
    );
};

ChoiceButton.propTypes = {
    label: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired,
    selected: PropTypes.bool,
    disabled: PropTypes.bool,
};

export default ChoiceButton;
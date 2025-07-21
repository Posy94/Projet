import React from "react";
import PropTypes from 'prop-types';

const ProgressBar = ({ value, max = 100, color = 'bg-blue-600', label }) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    return (
        <div className="w-full">
            {label && (
                <div className="mb-1 text-sm font-medium text-gray-700 flex justify-between">
                    <span>{label}</span>
                    <span>{Math.round(percentage)}%</span>
                </div>
            )}
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                <div
                    className={`h-full ${color} transition-all duration-300`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
};

ProgressBar.propTypes = {
    value: PropTypes.number.isRequired,
    max: PropTypes.number,
    color: PropTypes.string,
    label: PropTypes.string,
};

export default ProgressBar;
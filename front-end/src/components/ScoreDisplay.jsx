import React from "react";
import PropTypes from 'prop-types';
import { Trophy } from 'lucide-react';

const ScoreDisplay = ({ label = 'Score', score = 0, icon = true }) => {
    return (
        <div className="flex items-center gap-3 bg-white p-4 rounded-xl shadow-md border border-gray-200">
            {icon && <Trophy className="text-yellow-500" size={28} />}
            <div>
                <div className="text-sm text-gray-500">{label}</div>
                <div className="text-2xl font-bold text-gray-800">{score}</div>
            </div>
        </div>
    );
};

ScoreDisplay.propTypes = {
    label: PropTypes.string,
    score: PropTypes.number,
    icon: PropTypes.bool,
};

export default ScoreDisplay;
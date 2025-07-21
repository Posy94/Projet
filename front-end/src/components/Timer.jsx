import React from "react";
import PropTypes from 'prop-types';

const formatTimer = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) /60);
    const seconds = totalSeconds % 60;

    const pad = (num) => String(num).padStart(2, '0');

    return hours > 0
        ? `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
        : `${pad(minutes)}:${pad(seconds)}`;
};

const Timer = ({ seconds }) => {
    return (
        <span className="font-mono text-lg text-gray-800">
            {formatTimer(seconds)}
        </span>
    );
};

Timer.propTypes = {
    seconds: PropTypes.number.isRequired,
};

export default Timer
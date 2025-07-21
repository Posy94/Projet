import React from "react";
import PropTypes from 'prop-types';

const Badge = ({ label, color = 'blue' }) => {
    return (
        <span className={`inline-block px-3 py-1 text-sm font-semibold text-white bg-${color}-500 rounded-full`}>
            {label}
        </span>
    );
};

Badge.propTypes = {
    label: PropTypes.string.isRequired,
    color: PropTypes.string,
};

export default Badge;
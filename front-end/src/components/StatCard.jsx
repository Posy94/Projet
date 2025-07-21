import React from "react";
import PropTypes from 'prop-types';
import { BarChart2, TrendingUp, Users } from 'lucide-react';

const icons = {
    chart: <BarChart2 className="text-blue-600" />,
    growth: <TrendingUp className="text-green-600" />,
    users: <Users className="text-purple-600" />,
};

const statCard = ({ label, value, iconType = 'chart' }) => {
    const icon = icons[iconType] || icons.chart;

    return (
        <div className="bg-white p-5 rounded-2xl shadow-md flex items-center gap-4 border border-gray-200">
            <div className="bg-gray-100 p-3 rounded-full">{icon}</div>
            <div>
                <p className="text-sm text-gray-500">{label}</p>
                <p className="text-2xl font-semibold text-gray-800">{value}</p>
            </div>
        </div>
    );
};

statCard.propTypes = {
    label: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    iconType: PropTypes.oneOf(['chart', 'growth', 'users']),
};

export default statCard;
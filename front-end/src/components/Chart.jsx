import React from "react";
import PropTypes from 'prop-types';
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
} from 'recharts';

const Chart = ({ data, dataKeyX, dataKeyY, label }) => {
    return (
        <div className="bg-white rounded-2xl p-5 shadow-md w-full h-64">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">{label}</h3>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                    <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
                    <XAxis datakey={dataKeyX} />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey={dataKeyY} stroke="#3b82f6" strokeWidth={2} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

Chart.propTypes = {
    data: PropTypes.arrayOf(PropTypes.object).isRequired,
    dataKeyX: PropTypes.string.isRequired,
    dataKeyY: PropTypes.string.isRequired,
    label: PropTypes.string,
};

export default Chart;
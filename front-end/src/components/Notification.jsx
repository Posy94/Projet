import React from "react";
import PropTypes from 'prop-types';
import { XCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

const typeStyles = {
    success: {
        icon: <CheckCircle className="text-green-600" />,
        bg: 'bg-green-100',
        text: 'text-green-800',
    },
    error: {
        icon: <XCircle className="text-red-600" />,
        bg: 'bg-red-100',
        text: 'text-red-800',
    },
    warning: {
        icon: <AlertTriangle className="text-yellow-600" />,
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
    },
    error: {
        icon: <Info className="text-blue-600" />,
        bg: 'bg-blue-100',
        text: 'text-blue-800',
    },
};

const Notification = ({ message, type = 'info', onClose }) => {
    const style = typeStyles[type] || typeStyles.info;

    return (
        <div
            className={`flex items-start gap-2 p-4 rounded-xl shadow-md ${style.bg} ${style.text} animate-fade-in`}
        >
            <div className="mt-1">{style.icon}</div>
            <div className="flex-1">{message}</div>
            {onClose && (
                <button onClick={onClose} className="ml-2 text-sm underline">
                    Fermer
                </button>
            )}
        </div>
    );
};

Notification.propTypes = {
    message: PropTypes.string.isRequired,
    type: PropTypes.oneOf(['success', 'error', 'warning', 'info']),
    onClose: PropTypes.func,
};

export default Notification;
import React from "react";

const LoadingSpinner = ({ size = 24, color = 'text-blue-600' }) => {
    return (
        <div className="flex justify-center items-center">
            <div
                className={`animate-spin rounded-full border-4 border-t-transparent ${color}`}
                style={{
                    width: size,
                    height: size,
                    borderTopColor: 'transparent',
                    borderRightColor: "currentcolor",
                    borderBottomColor: "currentcolor",
                    borderLeftColor: "currentcolor",                
                }}
            />
        </div>
    );
};

export default LoadingSpinner;
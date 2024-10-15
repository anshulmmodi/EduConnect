// CustomAlert.js
import React, { useEffect } from 'react';

const CustomAlert = ({ message, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 5000); 
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className="custom-alert">
            <h2>{message}</h2>
            <button onClick={onClose}>View Results</button>
        </div>
    );
};

export default CustomAlert;

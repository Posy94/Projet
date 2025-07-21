import React from "react";
import PropTypes from 'prop-types';
import Modal from './Modal';

const ConfirmDialog = ({ isOpen, onConfirm, onCancel, title, message }) => {
    return (
        <Modal isOpen={isOpen} onClose={onCancel} title={title}>
            <div className="text-gray-700 mb-6">{message}</div>

            <div className="flex justify-end gap-4">
                <button 
                    onClick={onCancel}
                    className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 transition"
                >
                    Annuler
                </button>
                <button 
                    onClick={onConfirm}
                    className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
                >
                    Confirmer
                </button>
            </div>
        </Modal>
    );
};

ConfirmDialog.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onConfirm: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    title: PropTypes.string,
    message: PropTypes.string.isRequired,
};

export default ConfirmDialog;
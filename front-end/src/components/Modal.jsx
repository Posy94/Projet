import React from "react";
import Proptypes from 'prop-types';
import { X } from 'lucide-react';
import PropTypes from "prop-types";

const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 relative animate-fade-in">
                {/* Bouton de fermeture */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
                    aria-label="Fermer"
                >
                    <X />
                </button>

                {/* Titre */}
                {title && <h2 classname="text-xl font-semibold mb-4">{title}</h2>}

                {/* Contenu */}
                <div>{children}</div>
            </div>
        </div>
    );
};

Modal.propTypes = {
    isOpen: Proptypes.bool.isRequired,
    onClose: Proptypes.func.isRequired,
    title: PropTypes.string,
    children: PropTypes.node.isRequired,
};

export default Modal;
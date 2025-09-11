import React, { useState } from "react";

const Contact = () => {
    const [formData, setFormData] = useState({
        nom: '',
        email: '',
        message: '',
    });
    
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitMessage, setSubmitMessage] = useState('');

    // 🛡️ FONCTION DE VALIDATION ET SANITISATION
    const validateAndSanitize = (data) => {
        const errors = {};
        const sanitized = {};

        // Sanitisation : supprime les caractères dangereux
        const sanitizeString = (str) => {
            return str
                .trim()
                .replace(/[<>]/g, '') // Supprime < et >
                .substring(0, 500); // Limite la longueur
        };

        // Validation du nom
        sanitized.nom = sanitizeString(data.nom);
        if (!sanitized.nom) {
            errors.nom = "Le nom est obligatoire";
        } else if (sanitized.nom.length < 2) {
            errors.nom = "Le nom doit contenir au moins 2 caractères";
        } else if (!/^[a-zA-ZÀ-ÿ\s-']+$/.test(sanitized.nom)) {
            errors.nom = "Le nom ne peut contenir que des lettres, espaces, tirets et apostrophes";
        }

        // Validation de l'email
        sanitized.email = data.email.trim().toLowerCase();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!sanitized.email) {
            errors.email = "L'email est obligatoire";
        } else if (!emailRegex.test(sanitized.email)) {
            errors.email = "Veuillez saisir un email valide";
        }

        // Validation du message
        sanitized.message = sanitizeString(data.message);
        if (!sanitized.message) {
            errors.message = "Le message est obligatoire";
        } else if (sanitized.message.length < 10) {
            errors.message = "Le message doit contenir au moins 10 caractères";
        } else if (sanitized.message.length > 500) {
            errors.message = "Le message ne peut pas dépasser 500 caractères";
        }

        return { sanitized, errors, isValid: Object.keys(errors).length === 0 };
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Efface l'erreur du champ modifié
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitMessage('');

        // 🛡️ VALIDATION ET SANITISATION
        const { sanitized, errors: validationErrors, isValid } = validateAndSanitize(formData);
        
        if (!isValid) {
            setErrors(validationErrors);
            setIsSubmitting(false);
            return;
        }

        try {
            // 📤 ENVOI SÉCURISÉ (remplace par ton API)
            console.log("Données sanitisées :", sanitized);
            
            // Simulation d'envoi
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // ✅ SUCCÈS
            setSubmitMessage("✅ Votre message a bien été envoyé ! Nous vous répondrons rapidement.");
            setFormData({ nom: '', email: '', message: '' });
            setErrors({});
            
        } catch (error) {
            // ❌ ERREUR
            setSubmitMessage("❌ Une erreur s'est produite lors de l'envoi. Veuillez réessayer.");
            console.error("Erreur envoi:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-lg mt-10">
            <h1 className="text-3xl font-bold text-center text-green-600 mb-6">
                Contactez-nous
            </h1>
            
            {/* 💬 MESSAGE DE RETOUR */}
            {submitMessage && (
                <div className={`mb-4 p-3 rounded-lg text-center ${
                    submitMessage.includes('✅') 
                        ? 'bg-green-100 text-green-800 border border-green-200' 
                        : 'bg-red-100 text-red-800 border border-red-200'
                }`}>
                    {submitMessage}
                </div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit}>
                {/* 👤 NOM */}
                <div>
                    <label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-1">
                        Nom
                    </label>
                    <input
                        type="text"
                        id="nom"
                        name="nom"
                        value={formData.nom}
                        onChange={handleChange}
                        maxLength="50"
                        disabled={isSubmitting}
                        className={`mt-1 block w-full px-4 py-2 border rounded-md shadow-sm transition-colors
                            ${errors.nom 
                                ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
                                : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                            }
                            ${isSubmitting ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
                        `}
                        placeholder="Votre nom complet"
                    />
                    {errors.nom && (
                        <p className="mt-1 text-sm text-red-600">⚠️ {errors.nom}</p>
                    )}
                </div>

                {/* ✉️ EMAIL */}
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                    </label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        maxLength="100"
                        disabled={isSubmitting}
                        className={`mt-1 block w-full px-4 py-2 border rounded-md shadow-sm transition-colors
                            ${errors.email 
                                ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
                                : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                            }
                            ${isSubmitting ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
                        `}
                        placeholder="votre.email@exemple.com"
                    />
                    {errors.email && (
                        <p className="mt-1 text-sm text-red-600">⚠️ {errors.email}</p>
                    )}
                </div>

                {/* 💬 MESSAGE */}
                <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                        Message
                    </label>
                    <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        rows={5}
                        maxLength="500"
                        disabled={isSubmitting}
                        className={`mt-1 block w-full px-4 py-2 border rounded-md shadow-sm transition-colors resize-none
                            ${errors.message 
                                ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
                                : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                            }
                            ${isSubmitting ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
                        `}
                        placeholder="Décrivez votre demande en détail..."
                    />
                    <div className="flex justify-between items-center mt-1">
                        {errors.message && (
                            <p className="text-sm text-red-600">⚠️ {errors.message}</p>
                        )}
                        <p className="text-xs text-gray-500 ml-auto">
                            {formData.message.length}/500 caractères
                        </p>
                    </div>
                </div>

                {/* 🚀 BOUTON SUBMIT */}
                <div className="text-center pt-4">
                    <button 
                        type="submit"
                        disabled={isSubmitting}
                        className={`px-8 py-3 rounded-lg font-medium transition-all transform
                            ${isSubmitting 
                                ? 'bg-gray-400 cursor-not-allowed' 
                                : 'bg-green-600 hover:bg-green-700 hover:scale-105 active:scale-95'
                            } text-white shadow-lg
                        `}
                    >
                        {isSubmitting ? (
                            <span className="flex items-center gap-2">
                                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                                Envoi en cours...
                            </span>
                        ) : (
                            '📤 Envoyer le message'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Contact;

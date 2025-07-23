import React, { useState } from "react";

const Contact = () => {
    const [forData, setFormData] = useState({
        nom: '',
        email: '',
        message: '',
    });

    const handleChange = (e) => {
        setFormData({
            ...FormData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Données du formulaire :", FormData);
        alert("Message envoyé !");
        setFormData({ nom: '', email: '', message: '' });
    };

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-lg mt-10">
            <h1 className="text-3xl font-bold text-center text-blue-600 mb-6">Contact</h1>
            <form className="space-y-4" onSubmit={{handleSubmit}}>
                <div>
                    <label htmlFor="nom" className="block text-sm font-medium text-gray-700">Nom</label>
                    <input
                        type="text"
                        id="nom"
                        name="nom"
                        value={FormData.nom}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full px-4 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 border-gray-300"
                    />
                </div>
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={FormData.email}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full px-4 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 border-gray-300"
                    />
                </div>
                <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message</label>
                    <textarea
                        id="message"
                        name="message"
                        value={FormData.message}
                        onChange={handleChange}
                        required
                        rows={4}
                        className="mt-1 block w-full px-4 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 border-gray-300"
                    ></textarea>
                </div>
                <div className="text-center">
                    <button className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition" type="submit">
                        Envoyer
                    </button>
                </div>
            </form>
        </div>
    );
};
export default Contact;
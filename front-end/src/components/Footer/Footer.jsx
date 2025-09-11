// 📁 components/Footer.jsx

import React from "react";
import { Link } from 'react-router-dom';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-gradient-to-br from-green-500 to-green-700 text-white mt-auto border-t border-white/10">
            <div className="max-w-6xl mx-auto px-6 py-8">
                
                {/* CONTENU PRINCIPAL */}
                <div className="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0">

                    {/* LIENS */}
                    <div className="flex items-center space-x-6 text-sm">
                        <Link 
                            to="/cgu" 
                            className="text-gray-700 hover:text-purple-600 transition-colors"
                        >
                            📋 Conditions Générales
                        </Link>
                        <span className="text-gray-600">|</span>
                        <span className="text-gray-700">
                            &copy; {currentYear} PFC
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

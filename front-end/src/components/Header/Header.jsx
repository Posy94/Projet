import { useState } from "react";
import { NavLink } from "react-router";
import useUser from "../../hooks/useUser";
import ProfilSlider from '../ProfilSlider';
import axios from "axios";

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfilOpen, setIsProfilOpen] = useState(false);
    const { user, loading, logout, updateUser } = useUser();

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const toggleProfile = () => {
        setIsProfilOpen(!isProfilOpen);
    };

    if (loading) {
        return (
            <header className="relative w-full bg-white shadow-[0_2px_10px_rgba(0,0,0,0.1)] z-10">
                <div className="flex items-center justify-center p-5">
                    <span className="text-slate-600">⏳ Chargement...</span>
                </div>
            </header>
        )
    }

    const handleLogout = async () => {
        try {
            const response = await axios.post('http://localhost:8000/api/auth/logout', {}, {
                withCredentials: true // 🔥 Important pour les cookies !
            });

            if (response.data.success) {
                logout();
                localStorage.removeItem('token');
                setIsMenuOpen(false);
                setIsProfilOpen(false);
                window.location.href = '/connexion'
            }

        } catch (error) {
            logout();
            localStorage.removeItem('token');
            setIsProfilOpen(false);
            window.location.reload();
        }
    };

    return (
        <>
            <header className="relative w-full bg-white shadow-[0_2px_10px_rgba(0,0,0,0.1)] z-10">

                {/* BOUTON BURGER POUR LES MOBILES */}
                <button
                    onClick={toggleMenu}
                    className="md:hidden fixed top-5 left-5 z-[1000] bg-slate-700 text-white border-none p-3 rounded-lg cursor-pointer shadow-[0_2px_10px_rgba(0,0,0,0.2)] transition-all duration-200 hover:bg-slate-600 hover:scale-105"
                >
                    <div className="w-[25px] h-5 relative flex flex-col justify-between">  
                        <span className={`w-full h-[3px] bg-white transition-all duration-300 ease-in-out transform origin-center ${
                            isMenuOpen ? 'rotate-45 translate-y-[8.5px]' : ''
                        }`}></span>
                        <span className={`w-full h-[3px] bg-white transition-all duration-300 ease-in-out ${
                            isMenuOpen ? 'opacity-0' : ''
                        }`}></span>
                        <span className={`w-full h-[3px] bg-white transition-all duration-300 ease-in-out transform origin-center ${
                            isMenuOpen ? '-rotate-45 -translate-y-[8.5px]' : ''
                        }`}></span>
                    </div> 
                </button>

                {/* BOUTON PROFIL POUR MOBILES */}

                {user && (
                    <button
                        onClick={toggleProfile}
                        className="md:hidden fixed top-5 right-5 bg-blue-600 hover:bg-blue-700 text-white border-none rounded-full w-14 h-14 text-2xl cursor-pointer z-[2000] shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105"
                        title="Ouvrir le profil"
                    >
                        {user.avatar || '👤'}
                    </button>
                )}

                {/* NAVIGATION POUR LES ECRANS DESKTOP */}
                <nav className="hidden md:flex justify-between items-center max-w-[1200px] mx-auto px-5 py-4">

                    {/* LOGO + NAVIGATION GAUCHE */}
                    <div className="flex items-center space-x-8">
                        {/* LOGO */}
                        <h1 className="text-xl font-bold text-blue-600">PFC</h1>

                        {/* LIENS PRINCIPAUX */}
                        <ul className="flex items-center space-x-6 list-none m-0 p-0">
                            <li className="m-0">
                                <NavLink
                                    to='/'
                                    className="text-[#1a202c] no-underline px-3 py-2 transition-all duration-200 hover:text-[#3182ce] active:font-bold"
                                >
                                    Accueil
                                </NavLink>
                            </li>
                            <li className="m-0">
                                <NavLink
                                    to='/regles'
                                    className="text-[#1a202c] no-underline px-3 py-2 transition-all duration-200 hover:text-[#3182ce] active:font-bold"
                                >
                                    Règles
                                </NavLink>
                            </li>
                            <li className="m-0">
                                <NavLink
                                    to='/aPropos'
                                    className="text-[#1a202c] no-underline px-3 py-2 transition-all duration-200 hover:text-[#3182ce] active:font-bold"
                                >
                                    À propos
                                </NavLink>
                            </li>
                            {user && (
                                <li className="m-0">
                                    <NavLink
                                        to='/listeSalons'
                                        className="text-[#1a202c] no-underline px-3 py-2 transition-all duration-200 hover:text-[#3182ce] active:font-bold"
                                    >
                                        Salons
                                    </NavLink>
                                </li>
                            )}
                        </ul>
                    </div>

                    {/* NAVIGATION DROITE */}
                    <div className="flex items-center space-x-4">
                        {user ? (
                            // UTILISATEUR CONNECTÉ
                            <button
                                onClick={toggleProfile}
                                className="flex items-center space-x-2 text-[#1a202c] hover:text-[#3182ce] px-3 py-2 rounded-lg hover:bg-gray-100 transition-all duration-200"
                            >
                                <span className="text-lg">{user.avatar || '👤'}</span>
                                <span className="font-medium">{user.username}</span>
                                <span className="text-xs">▼</span>
                            </button>
                        ) : (
                            // UTILISATEUR NON CONNECTÉ
                            <ul className="flex items-center space-x-4 list-none m-0 p-0">
                                <li className="m-0">
                                    <NavLink
                                        to='/inscription'
                                        className="text-[#1a202c] no-underline px-3 py-2 transition-all duration-200 hover:text-[#3182ce] active:font-bold"
                                    >
                                        Inscription
                                    </NavLink>
                                </li>
                                <li className="m-0">
                                    <NavLink
                                        to='/connexion'
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all duration-200 no-underline"
                                    >
                                        Connexion
                                    </NavLink>
                                </li>
                            </ul>
                        )}
                    </div>
                </nav>


                {/* OVERLAY SOMBRE MOBILE*/}

                {isMenuOpen && (
                    <div
                        className="md:hidden fixed top-0 left-0 w-screen h-screen bg-black/50 z-[998]"
                        onClick={toggleMenu}
                    />
                )}

                {/* MENU COULISSANT POUR LES MOBILES */}

                <nav className={`md:hidden fixed top-0 w-[300px] h-screen bg-gradient-to-br from-slate-700 to-slate-600 transition-all duration-300
                    ease-[cubic-bezier(0.25,0.46,0.45,0.94)] z-[999] shadow-[2px_0_10px_rgba(0,0,0,0.3)] overflow-y-auto max-[480px]:w-[280px] ${
                        isMenuOpen ? 'left-0' : '-left-[300px] max-[480px]:-left-[280px]'
                    }`}>

                    <ul className="list-none pt-[60px] px-5 pb-[60px] m-0 flex flex-col min-h-[calc(100vh-40px)] max-[480px]:px-[15px]">

                            <li className="my-[10px] mx-0">
                            <NavLink to='/' onClick={toggleMenu}
                            className="text-white no-underline p-3 block rounded-[5px] transition-all duration-200 hover:bg-white/10 active:bg-white/20 active:font-bold max-[480px]:px-3 max-[480px]:py-[10px] max-[480px]:text-sm">
                                Accueil
                            </NavLink>
                        </li>
                        <li className="my-[10px] mx-0">
                            <NavLink to='/regles' onClick={toggleMenu}
                            className="text-white no-underline p-3 block rounded-[5px] transition-all duration-200 hover:bg-white/10 active:bg-white/20 active:font-bold max-[480px]:px-3 max-[480px]:py-[10px] max-[480px]:text-sm">
                                Règles du jeu
                            </NavLink>
                        </li>

                        {!user ? (
                            <>
                                <li className="my-[10px] mx-0">
                                    <NavLink to='/inscription' onClick={toggleMenu}
                            className="text-white no-underline p-3 block rounded-[5px] transition-all duration-200 hover:bg-white/10 active:bg-white/20 active:font-bold max-[480px]:px-3 max-[480px]:py-[10px] max-[480px]:text-sm">
                                        Inscription
                                    </NavLink>
                                </li>
                                <li className="my-[10px] mx-0">
                                    <NavLink to='/connexion' onClick={toggleMenu}
                            className="text-white no-underline p-3 block rounded-[5px] transition-all duration-200 hover:bg-white/10 active:bg-white/20 active:font-bold max-[480px]:px-3 max-[480px]:py-[10px] max-[480px]:text-sm">
                                        Connexion
                                    </NavLink>
                                </li>
                            </>
                        ) : (
                            <>
                                <li className="my-[10px] mx-0">
                                    <NavLink to='/creationSalon' onClick={toggleMenu}
                            className="text-white no-underline p-3 block rounded-[5px] transition-all duration-200 hover:bg-white/10 active:bg-white/20 active:font-bold max-[480px]:px-3 max-[480px]:py-[10px] max-[480px]:text-sm">
                                        Création d'un salon
                                    </NavLink>
                                </li>
                                <li className="my-[10px] mx-0">
                                    <NavLink to='/listeSalons' onClick={toggleMenu}
                            className="text-white no-underline p-3 block rounded-[5px] transition-all duration-200 hover:bg-white/10 active:bg-white/20 active:font-bold max-[480px]:px-3 max-[480px]:py-[10px] max-[480px]:text-sm">
                                        Liste des Salons
                                    </NavLink>
                                </li>
                                <li className="my-[10px] mx-0">
                                    <NavLink to='/notifications' onClick={toggleMenu}
                            className="text-white no-underline p-3 block rounded-[5px] transition-all duration-200 hover:bg-white/10 active:bg-white/20 active:font-bold max-[480px]:px-3 max-[480px]:py-[10px] max-[480px]:text-sm">
                                        Notifications
                                    </NavLink>
                                </li>
                                <li className="my-[10px] mx-0">
                                    <NavLink to='/jeu' onClick={toggleMenu}
                            className="text-white no-underline p-3 block rounded-[5px] transition-all duration-200 hover:bg-white/10 active:bg-white/20 active:font-bold max-[480px]:px-3 max-[480px]:py-[10px] max-[480px]:text-sm">
                                        Jouer
                                    </NavLink>
                                </li>
                                <li className="my-[10px] mx-0">
                                    <button
                                        onClick={() => {toggleProfile(); toggleMenu();}}
                                        className="text-white no-underline p-3 block rounded-[5px] transition-all duration-200 hover:bg-white/10 active:bg-white/20 active:font-bold w-full text-left bg-transparent border-none cursor-pointer max-[480px]:px-3 max-[480px]:py-[10px] max-[480px]:text-sm"
                                    >
                                        👤 Mon Profil
                                    </button>
                                </li>
                            </>
                        )}                   
                        <li className="my-[10px] mx-0">
                            <NavLink to='/cgu' onClick={toggleMenu}
                            className="text-white no-underline p-3 block rounded-[5px] transition-all duration-200 hover:bg-white/10 active:bg-white/20 active:font-bold max-[480px]:px-3 max-[480px]:py-[10px] max-[480px]:text-sm">
                                Conditions générales d'utilisation
                            </NavLink>
                        </li>
                        <li className="my-[10px] mx-0">
                            <NavLink to='/aPropos' onClick={toggleMenu}
                            className="text-white no-underline p-3 block rounded-[5px] transition-all duration-200 hover:bg-white/10 active:bg-white/20 active:font-bold max-[480px]:px-3 max-[480px]:py-[10px] max-[480px]:text-sm">
                                A propos
                            </NavLink>
                        </li>
                        <li className="my-[10px] mx-0">
                            <NavLink to='/contact' onClick={toggleMenu}
                            className="text-white no-underline p-3 block rounded-[5px] transition-all duration-200 hover:bg-white/10 active:bg-white/20 active:font-bold max-[480px]:px-3 max-[480px]:py-[10px] max-[480px]:text-sm">
                                Contact
                            </NavLink>
                        </li>
                    </ul>
                </nav>
            </header>

            {/* PROFIL GLISSANT */}

            {user && (
                    <ProfilSlider
                        isOpen={isProfilOpen}
                        onClose={() => setIsProfilOpen(false)} 
                        user={user}
                        updateUser={updateUser}
                        onLogout={handleLogout}
                    />
            )}
        </>
    )
}

export default Header
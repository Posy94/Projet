import React, { useState, usestate } from "react";
import { NavLink } from "react-router";
import useUser from "../../hooks/useUser";
import ProfilSlider from '../ProfilSlider';

//CSS
import style from './Header.module.css'

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfilOpen, setIsProfilOpen] = useState(false);

    const { user, loading, updateUser } = useUser();

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const toggleProfile = () => {
        setIsProfilOpen(!isProfilOpen)
    }

    if (loading) {
        return (
            <header className={style.header}>
                <div className={style.userSection}>
                    <span>⏳ Chargement...</span>
                </div>
            </header>
        )
    }

    return (
        <>
            <header className={style.header}>

                {/* BOUTON BURGER POUR LES MOBILES */}

                <button
                    onClick={toggleMenu}
                    className={style.burgerButton}
                >

                    <div className={`${style.burgerIcon} ${isMenuOpen ? style.active : ''}`}>  
                        <span></span>
                        <span></span>
                        <span></span>
                    </div> 

                </button>

                {/* BOUTON PROFIL UTILISATEUR SI CONNECTE */}

                {user && (
                    <div className={style.userSection}>
                        <button
                            onClick={toggleProfile}
                            className={style.profileButton}
                            title="Mon Profil"
                        >
                            <span className={style.avatar}>{user.avatar || '👤'}</span>
                            <span className={style.username}>{user.username}</span>
                            <span className={style.profileArrow}>⚙️</span>
                        </button>
                    </div>
                )}

                {/* MENU POUR LES DESKTOP */}

                <nav className={style.desktopMenu}>

                    <ul className={style.desktopList}>

                        <li>
                            <NavLink to='/'>
                                Accueil
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to='/regles'>
                                Règles du jeu
                            </NavLink>
                        </li>

                        {/* NAVIGATION CONDITIONNELLE SELON CONNEXION */}
                        {!user ? (
                            <>
                                <li>
                                    <NavLink to='/inscription'>
                                        Inscription
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink to='/connexion'>
                                        Connexion
                                    </NavLink>
                                </li>
                            </>
                        ) : (
                            <>
                                <li>
                                    <NavLink to='/creationSalon'>
                                        Création d'un salon
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink to='/listeSalons'>
                                        Liste des Salons
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink to='/notifications'>
                                        Notifications
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink to='/jeu'>
                                        Jouer
                                    </NavLink>
                                </li>
                            </>
                        )}                   
                        <li>
                            <NavLink to='/cgu'>
                                Conditions générales d'utilisation
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to='/apropos'>
                                A propos
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to='/contact'>
                                Contact
                            </NavLink>
                        </li>                   
                    </ul>
                </nav>

                {/* OVERLAY SOMBRE POUR LES MOBILES*/}

                {isMenuOpen && (
                    <div
                        className={style.overlay}
                        onClick={toggleMenu}
                    >                  
                    </div>
                )}

                {/* MENU COULISSANT POUR LES MOBILES */}

                <nav className={`${style.slideMenu} ${isMenuOpen ? style.open : ''}`}>

                    <ul className={style.menuList}>

                            <li>
                            <NavLink to='/'>
                                Accueil
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to='/regles'>
                                Règles du jeu
                            </NavLink>
                        </li>

                        {!user ? (
                            <>
                                <li>
                                    <NavLink to='/inscription'>
                                        Inscription
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink to='/connexion'>
                                        Connexion
                                    </NavLink>
                                </li>
                            </>
                        ) : (
                            <>
                                <li>
                                    <NavLink to='/creationSalon'>
                                        Création d'un salon
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink to='/listeSalons'>
                                        Liste des Salons
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink to='/notifications'>
                                        Notifications
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink to='/jeu'>
                                        Jouer
                                    </NavLink>
                                </li>
                                <li>
                                    <button
                                        onClick={() => {toggleProfile(); toggleMenu();}}
                                        className={style.mobileProfileBtn}
                                    >
                                        👤 Mon Profil
                                    </button>
                                </li>
                            </>
                        )}                   
                        <li>
                            <NavLink to='/cgu'>
                                Conditions générales d'utilisation
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to='/apropos'>
                                A propos
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to='/contact'>
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
                />
            )}
        </>
    )
}

export default Header
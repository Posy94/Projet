import React, { useState, usestate } from "react";
import { NavLink } from "react-router";

//CSS
import style from './Header.module.css'

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
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
                    <li>
                        <NavLink to='/inscription'>
                            Inscription
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to='/profilJoueur'>
                            Profil du joueur
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to='/connexion'>
                            Connexion
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to='/creationSalon'>
                            Création d'un salon
                        </NavLink>
                    </li>
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
                            <NavLink to='/' onClick={toggleMenu}>
                                Accueil
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to='/regles' onClick={toggleMenu}> 
                                Règles du jeu
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to='/inscription' onClick={toggleMenu}> 
                                Inscription
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to='/profilJoueur' onClick={toggleMenu}> 
                                Profil du joueur
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to='/connexion' onClick={toggleMenu}> 
                                Connexion
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to='/creationSalon' onClick={toggleMenu}> 
                                Création d'un salon
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to='/cgu' onClick={toggleMenu}> 
                                Conditions générales d'utilisation
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to='/apropos' onClick={toggleMenu}> 
                                A propos
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to='/contact' onClick={toggleMenu}> 
                                Contact
                            </NavLink>
                        </li>

                    </ul>
            </nav>
        </header>
    )
}

export default Header
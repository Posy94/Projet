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
        <header>

            {/* BOUTON BURGER */}

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

            {/* OVERLAY SOMBRE */}

            {isMenuOpen && (
                <div
                    className={style.overlay}
                    onClick={toggleMenu}
                >                  
                </div>
            )}

            {/* MENU COULISSANT*/}

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
                                A Propos
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
import React from "react";
import { NavLink } from "react-router";

//CSS
import style from './Header.module.css'

const Header = () => {
    return (
        <header>
            <nav>
                <ul className="d-flex list-unlisted">
                    <li className="m-4">
                        <NavLink to='/'>
                            Accueil
                        </NavLink>
                    </li>
                    <li className="m-4">
                        <NavLink to='/regles'> 
                            Règles du jeu
                        </NavLink>
                    </li>
                    <li className="m-4">
                        <NavLink to='/inscription'> 
                            Inscription
                        </NavLink>
                    </li>
                    <li className="m-4">
                        <NavLink to='/profilJoueur'> 
                            Profil du joueur
                        </NavLink>
                    </li>
                    <li className="m-4">
                        <NavLink to='/connexion'> 
                            Connexion
                        </NavLink>
                    </li>
                    <li className="m-4">
                        <NavLink to='/creationSalon'> 
                            Création d'un salon
                        </NavLink>
                    </li>
                    <li className="m-4">
                        <NavLink to='/cgu'> 
                            Conditions générales d'utilisation
                        </NavLink>
                    </li>
                    <li className="m-4">
                        <NavLink to='/apropos'> 
                            A Propos
                        </NavLink>
                    </li>
                    <li className="m-4">
                        <NavLink to='/contact'> 
                            Contact
                        </NavLink>
                    </li>
                </ul>
            </nav>
        </header>
    )
}

export default Header
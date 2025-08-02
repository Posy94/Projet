import { Routes, Route } from 'react-router';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router';
import useUser from './hooks/useUser';

//COMPONENTS & PAGES
import Layout from './components/Layout/Layout';
import Home from './pages/home';
import Regles from './pages/regles';
import Inscription from './pages/inscription';
import ProfilJoueur from './pages/profilJoueur';
import Connexion from './pages/connexion';
import CreationSalon from './pages/creationSalon';
import Cgu from './pages/cgu';
import APropos from './pages/aPropos';
import Contact from './pages/contact';
import Amis from './pages/amis';
import Classements from './pages/classements';
import Defis from './pages/defis';
import Historiques from './pages/historiques';
import Jeu from './pages/jeu';
import ListeSalons from './pages/listeSalons';
import Notitfications from './pages/notifications';
import Salon from './pages/salon';
import Statistiques from './pages/statistiques';
import Recompenses from './pages/recompenses';

import './App.css';

function App() {
  const { user, loading, setIsAuthenticated } = useUser();

  if (loading) return <div>Chargement...</div>

  return (
    <div>
      <Routes>
        <Route element={<Layout/>}>
          <Route index element={<Home />}/>
          {/* PAGES STATIQUES SIMPLES */}
          <Route path='/regles' element={<Regles/>}/>
          <Route path='/contact' element={<Contact/>}/>
          <Route path='/cgu' element={<Cgu/>}/>
          <Route path='/apropos' element={<APropos/>}/>
          {/* PAGES UTILISATEUR */}
          <Route path='/notifications' element={<Notitfications/>}/>
          <Route path='/profiljoueur' element={<ProfilJoueur/>}/>
          <Route path='/inscription' element={<Inscription/>}/>
          <Route path='/connexion' element={<Connexion/>}/>
          {/* FONCTIONNALITE MULTIJOUEUR */}
          <Route path='/creationSalon' element={<CreationSalon/>}/>
          <Route path='/listeSalons' element={<ListeSalons/>}/>
          <Route path='/salon' element={<Salon/>}/>
          {/* JEU */}
          <Route path='/jeu' element={<div className="text-center mt-10">
            <h2>Sélectionnez un salon pour jouer</h2>
            <Link to="/listeSalons" className="text-blue-500 underline">
              Voir la liste des salons
            </Link>
          </div>}/>
          <Route path='/jeu/:salonId' element={<Jeu user={user}/>}/>
          {/* CONTENU POST-JEU */}
          <Route path='/amis' element={<Amis/>}/>
          <Route path='/classements' element={<Classements/>}/>
          <Route path='/defis' element={<Defis/>}/>
          <Route path='/historiques' element={<Historiques/>}/>
          <Route path='/statistiques' element={<Statistiques/>}/>
          <Route path='/recompenses' element={<Recompenses/>}/>
        </Route>
      </Routes>
    </div>
  );
}

export default App;

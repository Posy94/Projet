import { Routes, Route } from 'react-router';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router';

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
import ProfileSlider from './components/ProfilSlider';

import './App.css';

function App() {
  const [user,setUser] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false)

  useEffect(() => {
    console.log('🔄 useEffect déclenché - Vérification du profil...');
    axios.get('http://localhost:8000/api/auth/profile', { withCredentials: true })
      .then((res) => {
        console.log('✅ Utilisateur connecté:', res.data);
        setUser(res.data);
        console.log('📝 State user mis à jour');
      })
      .catch((error) => {
        console.log('ℹ️ Utilisateur non connecté');
        setUser(null);
      });
  }, []);

  console.log('📊 STATE USER ACTUEL:', user);

  return (
    <div>
      {user && (
        <>
          {/* Bouton profil fixe */}
          <button
          onClick={() => setIsProfileOpen(true)}
          className="fixed top-5 right-5 bg-blue-600 hover:bg-blue-700 text-white border-none rounded-full w-14 h-14 text-2xl cursor-pointer z-50 shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105"
          title='Ouvrir le profil'
          >
            👤
          </button>
          <ProfileSlider
            isOpen={isProfileOpen}
            onClose={() => setIsProfileOpen(false)}
            user={user}
            updatedUser={setUser}
          />
        </>
      )}

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
          <Route path='/inscription' element={<Inscription setUser={setUser}/>}/>
          <Route path='/connexion' element={<Connexion setUser={setUser}/>}/>
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

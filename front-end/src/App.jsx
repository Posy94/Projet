import { Routes, Route } from 'react-router';
import { useEffect, useState } from 'react';
import axios from 'axios';

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
  const [user,setUser] = useState(null);

  useEffect(() => {
    axios.get('http.//localhost:3000/api/users/getProfile', { withCredentials: true })
      .then((res) => setUser(res.data))
      .catch(() => setUser(null));
  }, []);

  return (
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
  );
}

export default App;

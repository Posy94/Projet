import { Routes, Route } from 'react-router';

//COMPONENTS & PAGES
import Layout from './components/Layout/Layout';
import Home from './pages/home';
import Regles from './pages/regles';
import Inscription from './pages/inscription';
import ProfilJoueur from './pages/profilJoueur';
import Connexion from './pages/connexion';
import CreationSalon from './pages/creationSalon';
import Cgu from './pages/cgu';
import APropos from './pages/apropos';
import Contact from './pages/contact';


import './App.css';

function App() {

  return (
    <Routes>
      <Route element={<Layout/>}>
        <Route index element={<Home />}/>
        <Route path='/regles' element={<Regles/>}/>
        <Route path='/inscription' element={<Inscription/>}/>
        <Route path='/profiljoueur' element={<ProfilJoueur/>}/>
        <Route path='/connexion' element={<Connexion/>}/>
        <Route path='/creationSalon' element={<CreationSalon/>}/>
        <Route path='/cgu' element={<Cgu/>}/>
        <Route path='/cgu' element={<Cgu/>}/>
        <Route path='/apropos' element={<APropos/>}/>
        <Route path='/contact' element={<Contact/>}/>

      </Route>
    </Routes>
  );
}

export default App;

import { Routes, Route } from 'react-router';
import { Link } from 'react-router';
import { UserProvider, useUser } from './contexts/UserContext';
import { SocketProvider } from './contexts/SocketContext';

//COMPONENTS & PAGES
import Layout from './components/Layout/Layout';
import Home from './pages/home';
import Regles from './pages/regles';
import Inscription from './pages/inscription';
import Connexion from './pages/connexion';
import Cgu from './pages/cgu';
import APropos from './pages/aPropos';
import Contact from './pages/contact';
import Classements from './pages/classements';
import Jeu from './pages/jeu';
import ListeSalons from './pages/listeSalons';
import Recompenses from './pages/recompenses';
import WaitingRoom from './components/WaitingRoom';
import ProtectedRoute from './components/ProtectedRoute';

import './App.css';

function AppContent() {
  const { user, loading } = useUser();

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
          <Route path='/inscription' element={<Inscription/>}/>
          <Route path='/connexion' element={<Connexion/>}/>
          {/* PAGES ADMINISTRATION */}
          <Route path="/listeSalons"
            element={
              <ProtectedRoute allowedRoles={['admin', 'superAdmin']}>
                <ListeSalons />
              </ProtectedRoute>
            }
          />
          <Route path='/waiting-room/:salonId' element={<WaitingRoom/>}/>
          {/* JEU */}
          <Route path='/jeu/:salonId' element={<Jeu user={user}/>}/>
          {/* CONTENU POST-JEU */}
          <Route path='/classements' element={<Classements/>}/>
          <Route path='/recompenses' element={<Recompenses/>}/>
        </Route>
      </Routes>
    </div>
  );
}

// COMPOSANT PRINCIPAL AVEC LE PROVIDER
function App() {
  return (
    <UserProvider>
      <SocketProvider>
        <AppContent />
      </SocketProvider>
    </UserProvider>
  );
}

export default App;

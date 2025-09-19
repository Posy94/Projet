import { useEffect, useState } from 'react';
import { useUser } from '../contexts/UserContext';

function ListeSalons() {
  const { user: currentUser, loading: userLoading } = useUser();
  const [salons, setSalons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingSalon, setEditingSalon] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(null);

  // ✅ FONCTION POUR VÉRIFIER LES DROITS DE SUPPRESSION
  const canDeleteSalon = (userRole) => {
    console.log("🔍 Vérification rôle:", userRole);  
    return ['admin', 'superAdmin'].includes(userRole);
  };

  // 📡 RÉCUPÉRER LES SALONS
  const fetchSalons = async () => {
    try {
      setLoading(true);
      setError("");

      console.log("🔍 Utilisateur actuel depuis Context:", currentUser);

      // ✅ TON BACKEND GÈRE DÉJÀ cookies + headers !
      const response = await fetch("http://localhost:8000/api/salons", {
        method: 'GET',
        credentials: 'include', // ✅ Envoie les cookies automatiquement
        headers: {
          'Content-Type': 'application/json'
          // Pas besoin d'Authorization si tu utilises les cookies !
        }
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log("📊 Données reçues:", data);

      // Gère différentes structures de réponse
      if (Array.isArray(data)) {
        setSalons(data);
      } else if (data.salons) {
        setSalons(data.salons);
      } else if (data.data) {
        setSalons(data.data);
      } else {
        setSalons([]);
      }

    } catch (err) {
      console.error("❌ Erreur fetch salons:", err);
      setError(err.message);
      setSalons([]);
    } finally {
      setLoading(false);
    }
  };

  // 🗑️ SUPPRIMER UN SALON
  const handleDelete = async (salonId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce salon ?')) {
      return;
    }

    try {
      console.log(`🗑️ Suppression du salon ${salonId} par ${currentUser.role}: ${currentUser.username}`);

      const response = await fetch(`http://localhost:8000/api/salons/${salonId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        credentials: 'include'
      });

      // ✅ VÉRIFICATION AMÉLIORE
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erreur HTTP:', response.status, errorText);
        throw new Error(`Erreur ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ Salon supprimé:', result);

      setShowDeleteModal(null); //POUR FERMER LE MODAL

      // Actualiser la liste
      fetchSalons();

    } catch (error) {
      console.error('❌ Erreur suppression:', error);
      setShowDeleteModal(null);
      alert('Erreur lors de la suppression du salon');
    }
  };


  // MODIFIER UN SALON
  const handleUpdate = async (salonId, formData) => {
    try {
      console.log(`✏️ Mise à jour du salon ${salonId}:`, formData);

      const response = await fetch(`http://localhost:8000/api/salons/${salonId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          maxPlayers: parseInt(formData.maxPlayers),
          maxRounds: parseInt(formData.maxRounds),
          status: formData.status
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || result.message || `Erreur ${response.status}`);
      }

      console.log("✅ Salon mis à jour:", result);

      // Met à jour le salon dans la liste locale
      setSalons(prev => prev.map(salon =>
        salon.salonId === salonId
          ? { ...salon, ...formData } // ✅ Merge les nouvelles données
          : salon
      ));

      setEditingSalon(null); // ✅ Ferme le formulaire
      setError(""); // ✅ Clear les erreurs

    } catch (err) {
      console.error("❌ Erreur mise à jour:", err);
      setError(`Erreur lors de la mise à jour: ${err.message}`);
    }
  };

  useEffect(() => {
    let interval;

    // Fonction pour initialiser le fetch et l'intervalle
    const initFetch = () => {
      fetchSalons();
      // ✅ Auto-refresh toutes les 20 secondes
      interval = setInterval(fetchSalons, 20000);
    };

    // ✅ Attend que le UserContext soit prêt
    if (!userLoading) {
      initFetch();
    }

    // ✅ Cleanup de l'intervalle
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [userLoading]);

  // 📝 FORMULAIRE D'ÉDITION
  const EditForm = ({ salon, onSave, onCancel }) => {

    const [formData, setFormData] = useState({
      name: salon.name || salon.nom || '',
      maxPlayers: salon.maxPlayers || salon.maxJoueurs || 4,
      maxRounds: salon.maxRounds || salon.maxManches || 3,
      status: salon.status || salon.statut || 'waiting'
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
      e.preventDefault();
      setIsSubmitting(true);

      try {
        await onSave(salon.salonId, formData);
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <form onSubmit={handleSubmit} className="bg-gray-50 p-4 rounded-lg mt-4">
        <h3 className="font-bold mb-3">🔧 Modifier le salon</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nom du salon</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full p-2 border rounded-lg"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Max joueurs</label>
            <input
              type="number"
              min="2"
              max="10"
              value={formData.maxPlayers}
              onChange={(e) => setFormData({...formData, maxPlayers: parseInt(e.target.value)})}
              className="w-full p-2 border rounded-lg"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Max rounds</label>
            <input
              type="number"
              min="1"
              max="10"
              value={formData.maxRounds}
              onChange={(e) => setFormData({...formData, maxRounds: parseInt(e.target.value)})}
              className="w-full p-2 border rounded-lg"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Statut</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({...formData, status: e.target.value})}
              className="w-full p-2 border rounded-lg"
            >
              <option value="waiting">En attente</option>
              <option value="playing">En cours</option>
              <option value="finished">Terminé</option>
            </select>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 mt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            💾 Sauvegarder
          </button>
        </div>
      </form>
    );
  };

  // 🎨 RENDU PRINCIPAL
  if (loading) return <div className="text-center py-8">⏳ Chargement des salons...</div>;
  
  if (error) return (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
      ❌ {error}
      <button 
        onClick={() => setError("")}
        className="ml-4 underline hover:no-underline"
      >
        Fermer
      </button>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">🎮 Liste des Salons</h1>
        <button
          onClick={fetchSalons}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center gap-2"
        >
          🔄 Actualiser
        </button>
      </div>

      {salons.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-xl text-gray-600">Aucun salon disponible</p>
          <p className="text-gray-500">Créez un nouveau salon pour commencer !</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {salons.map((salon) => (
            <div key={salon._id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-bold">{salon.name}</h2>
                  <p className="text-gray-600">ID: {salon.salonId}</p>
                </div>
                
                {/* STATUS BADGE */}
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  salon.status === 'waiting' ? 'bg-yellow-100 text-yellow-800' :
                  salon.status === 'playing' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {salon.status === 'waiting' ? '⏳ En attente' :
                   salon.status === 'playing' ? '🎮 En cours' : '✅ Terminé'}
                </div>
              </div>

              {/* INFOS SALON */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">Joueurs</p>
                  <p className="font-medium">{salon.players?.length || 0}/{salon.maxPlayers}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Round</p>
                  <p className="font-medium">{salon.currentRound}/{salon.maxRounds}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Type</p>
                  <p className="font-medium">{salon.gameType || 'PVP'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Créateur</p>
                  <p className="font-medium">{salon.userCreator?.username || 'Unknown'}</p>
                </div>
              </div>

              {/* FORME D'ÉDITION */}
              {editingSalon === salon.salonId && (
                <EditForm
                  salon={salon}
                  onSave={handleUpdate}
                  onCancel={() => setEditingSalon(null)}
                />
              )}

              {/* BOUTONS D'ACTION - Version améliorée */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                {/* ✅ BOUTON MODIFIER POUR TOUS */}
                {currentUser && (
                  <button
                    onClick={() => setEditingSalon(editingSalon === salon.salonId ? null : salon.salonId)}
                    className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${editingSalon === salon.salonId
                        ? 'bg-gray-500 text-white hover:bg-gray-600'
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                      }`}
                  >
                    {editingSalon === salon.salonId ? '❌ Annuler' : '🔧 Modifier'}
                  </button>
                )}

                {/* ✅ BOUTON SUPPRIMER POUR ADMIN/SUPERADMIN SEULEMENT */}
                {currentUser && canDeleteSalon(currentUser.role) && (
                  <button
                    onClick={() => setShowDeleteModal(salon)}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 flex items-center gap-2 transition-colors"
                    title={`Supprimer ce salon (${currentUser.role} uniquement)`}
                  >
                    🗑️ Supprimer
                  </button>
                )}
              </div>

            </div>
          ))}
        </div>
      )}

      {/* MODAL DE CONFIRMATION SUPPRESSION */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4">🗑️ Confirmer la suppression</h3>
            <div className="mb-4">
              <p className="text-gray-600 mb-3">Êtes-vous sûr de vouloir supprimer le salon :</p>
              <div className="bg-gray-100 p-3 rounded-lg">
                <p className="font-bold">{showDeleteModal.name}</p>
                <p className="text-sm text-gray-600">ID: {showDeleteModal.salonId}</p>
                <p className="text-sm text-gray-600">{showDeleteModal.players?.length || 0} joueurs connectés</p>
              </div>
              <p className="text-red-600 text-sm mt-3 font-medium">⚠️ Cette action est irréversible !</p>
            </div>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowDeleteModal(null)}
                className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => handleDelete(showDeleteModal.salonId)}
                className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Supprimer définitivement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ListeSalons;

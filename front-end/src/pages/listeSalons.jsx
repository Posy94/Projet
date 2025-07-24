import { useEffect, useState } from 'react'

function ListeSalons() {

  const [salon, setSalon] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,setError] = useState("");

  useEffect(() => {
    const fetchSalon = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/salons");
        if (!response.ok) throw new Error("Erreur lors du chargement des salons")
        const data = await response.json();
        setSalon(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSalon();
  }, []);

  if (loading) return <p className="text-center mt-10">Chargement...</p>;
  if (error) return <p className="text-center text-red-500 mt-10">{error}</p>

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4 text-center">Salons disponibles</h2>

      {salon.length === 0 ? (
        <p className="text-center text-gray-500">Aucun salon en attente pour le moment</p>
      ) : (
        <ul className="space-y-4">
          {salon.map(salon => (
            <li key={salon._id} className="p-4 border rounded flex justify-between items-center">
              <div>
                <p className="font-semibold text-lg">{salon.name}</p>
                <p className="text-sm text-gray-600">
                  Joueurs : {salon.players.length}/{salon.maxPlayers}
                </p>
                <p className="text-sm text-gray-500">Manches : {salon.maxRounds}</p>
              </div>
              <button
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                onClick={() => console.log("Rejoindre salon", salon._id)}            
              >
                Rejoindre
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ListeSalons

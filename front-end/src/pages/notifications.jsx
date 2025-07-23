import { useState, useEffect } from 'react'

function Notitfications() {

  const[notifications, setNotifications] = useState([]);

  useEffect(() => {
    // SIMULATION DE DONNEES A REMPLACER PAR UN APPEL API REEL
    const fakeData = [
      {
        id: 1,
        message: "Félicitations ! Vous avez gagné une partie contre Player123.",
        date: "2025-07-20T15:30:00Z",
        read: false,
      },
      {
        id: 2,
        message: "Vous avez reçu un nouveau badge : Stratège.",
        date: "2025-07-19T10:00:00Z",
        read: true,
      },
      {
        id: 3,
        message: "Défi lancé par Player456, répondez dans les 24h.",
        date: "2025-07-18T17:45:00Z",
        read: false,
      },
    ];

    setNotifications(fakeData);
  }, []);

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  return (
    <div className="max-3xl mx-auto p-6 bg-white shadow rounded mt-10">
      <h2 className="text-2xl font-bold mb-6 text-center">Mes notifications</h2>

      {notifications.length === 0 ? (
        <p className="text-center text-gray-500">Aucune notification pour le moment.</p>
      ) : (
        <ul className="space-y-4">
          {notifications.map((notif) => (
            <li
              className={`border p-4 rounded ${notif.read ? "bg-gray-100" : "bg-blue-50"}`}
              key={notif.id}
            >
              <p className="text-sm text-gray-700">{notif.message}</p>
              <div className="flex justify-between mt-2 text-sm text-gray-500">
                <span>{new Date(notif.date).toLocaleString()}</span>
                {!notif.read && (
                  <button
                    className="text-blue-600 hover:underline"
                    onClick={() => markAsRead(notif.id)}
                  >
                    Marquer comme lu
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Notitfications
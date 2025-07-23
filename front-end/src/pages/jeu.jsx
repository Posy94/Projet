import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import io from "socket.io-client";
import useUser from '../hooks/useUser';

const socket = io("http://localhost:5173");

const Jeu = () => {
  const user = useUser();

  useEffect(() => {
    if (!user) return;

    socket.emit("joinSalon", {
      salonId,
      userId: user._id,
      username: user.username,
    });

    socket.on("salonUpdated", updatedSalon => {
      setSalon(updatedSalon);
      setGameStatus(updatedSalon.status);
    });

    socket.on("gameStart", ({ round }) => {
      setRoundResult(null);
      setIsReady(false);
      setHasChosen(false);
    });

    socket.on("nextRound", ({ round }) => {
      setRoundResult(null);
      setIsReady(false);
      setHasChosen(false);
      setChoice(null);
    });

    socket.on("roundResult", data => {
      setRoundResult(data);
      setHasChosen(false);
    });

    socket.on("gameEnd", ({ finalResult }) => {
      setGameStatus("finished");
    });

    return () => {
      socket.emit("leaveSalon", { salonId, userId: user._id });
      socket.off();
    };
  }, [salonId, user]);

  const handleReady = () => {
    socket.emit("playerReady", {
      salonId,
      userId: user._id
    });
    setIsReady(true);
  };

  const handleChoice = (value) => {
    socket.emit("makeChoice", {
      salonId,
      userId: user._id,
      choice: value
    });
    setChoice(value);
    setHasChosen(true);
  };

  if (!salon) return <div className="text-center mt-10">Chargement du salon...</div>

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-center mb-4">Salon : {salon.name}</h2>

      <div className="grid grid-cols-2 gap-4 mb-6">
        {salon.players.map(p => (
          <div
            key={p.user._id}
            className={`p-4 rounded shadow ${
              p.user._id === user._id ? "bg-blue-100" : "bg-gray-100"
            }`}
          >
              <p className="font-semibold">{p.user.username}</p>
              <p className="text-sm">Prêt : {p.ready ? "✅" : "❌"}</p>
              <p className="text-sm">Choix : {p.choice ? "✔️" : "⏳"}</p>
          </div>
        ))}
      </div>

      {gameStatus === "waiting" && (
        <div className="text-center">
          {!isReady ? (
            <button
              onClick={handleReady}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Je suis prêt
            </button>
          ) : (
            <p className="text-yellow-600 font-medium">En attente de l'autre joueur...</p>
          )}
        </div>
      )}

      {gameStatus === "playing" && (
        <div className="text-center">
          {!hasChosen ? (
            <>
              <p className="mb-2">Faites votre choix :</p>
              <div className="flex justify-center gap-4">
                {["rock", "paper", "scissors"].map(item => (
                  <button
                    key={item}
                    onClick={() => handleChoice(item)}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 capitalize"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <p className="mt-4 text-blue-700 font-medium">En attente de l'autre joueur...</p>
          )}
        </div>
      )}

      {roundResult && (
        <div className="mt-6 text-center">
          <h3 className="text-xl font-bold">Résultat du Round</h3>
          <p className="text-lg">
            {
              roundResult.result === "draw"
                ? "Egalité !"
                : roundResult.result === "player1"
                ? "Le joueur 1 gagne"
                : "Le joueur 2 gagne"
            }
          </p>
          <div className="mt-2">
            {roundResult.choices.map(c => (
              <p key={c.userId}>
                {salon.players.find(p => p.user._id === c.userId)?.user.username}
              </p>
            ))}
          </div>
        </div>
      )}

      {gameStatus === "finished" && (
        <div className="mt-8 text-center text-green-700 font-semibold">
          🎉 Partie terminée !
        </div>
      )}
    </div>
  );
};

export default Jeu

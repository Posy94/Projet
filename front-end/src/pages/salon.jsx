import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import socket from "../services/socketService";
import { Button } from "@/components/ui/button";

function Salon() {
  const { id: salonId } = useParams();

  // États existants
  const [salonInfo, setSalonInfo] = useState(null);
  const [joueurs, setJoueurs] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [isReady, setIsReady] = useState(false);

  // 🎮 NOUVEAUX ÉTATS DE JEU
  const [gameState, setGameState] = useState('waiting'); // 'waiting', 'playing', 'results'
  const [myChoice, setMyChoice] = useState(null);
  const [roundResults, setRoundResults] = useState(null);
  const [countdown, setCountdown] = useState(null);

  useEffect(() => {
    // Connexions existantes
    socket.emit('joinSalon', { salonId });

    socket.on('salonInfo', (data) => {
      setSalonInfo(data.salon);
      setJoueurs(data.joueurs);
    });

    socket.on('updatePlayers', (joueurs) => {
      setJoueurs(joueurs);
    });

    socket.on('chatMessage', (msg) => {
      setChatMessages((prev) => [...prev, msg]);
    });

    // 🎮 NOUVEAUX ÉCOUTEURS DE JEU
    socket.on('gameStart', (data) => {
      console.log('🎮 Jeu commencé !', data);
      setGameState('playing');
      setMyChoice(null);
      setRoundResults(null);
    });

    socket.on('roundStart', (data) => {
      console.log('🚀 Nouveau round !', data);
      setGameState('playing');
      setMyChoice(null);
      setCountdown(data.countdown);
    });

    socket.on('roundEnd', (results) => {
      console.log('📊 Résultats du round:', results);
      setGameState('results');
      setRoundResults(results);
      setCountdown(null);
    });

    socket.on('gameEnd', (finalResults) => {
      console.log('🏆 Fin de partie !', finalResults);
      setGameState('finished');
      setRoundResults(finalResults);
    });

    return () => {
      socket.emit('leaveSalon', { salonId });
      socket.off('salonInfo');
      socket.off('updatePlayers');
      socket.off('chatMessage');
      socket.off('gameStart');
      socket.off('roundStart');
      socket.off('roundEnd');
      socket.off('gameEnd');
    };
  }, [salonId]);

  const envoyerMessage = () => {
    if (message.trim()) {
      socket.emit('chatMessage', { salonId, message });
      setMessage('');
    }
  };

  const handleReady = () => {
    socket.emit('toggleReady', { salonId });
    setIsReady(!isReady);
  };

  // 🎮 FAIRE UN CHOIX DE JEU
  const makeChoice = (choice) => {
    if (gameState !== 'playing' || myChoice) return;
    
    console.log('Choix fait:', choice);
    setMyChoice(choice);
    socket.emit('makeChoice', { salonId, choice });
  };

  // 🎮 INTERFACE DE JEU
  const renderGameInterface = () => {
    const choices = [
      { value: 'rock', emoji: '🪨', label: 'Pierre' },
      { value: 'paper', emoji: '📄', label: 'Papier' },
      { value: 'scissors', emoji: '✂️', label: 'Ciseaux' }
    ];

    if (gameState === 'waiting') {
      return (
        <div className="bg-blue-50 p-6 rounded-lg text-center">
          <h3 className="text-xl font-semibold mb-2">En attente du début de partie...</h3>
          <p className="text-gray-600">Tous les joueurs doivent être prêts</p>
        </div>
      );
    }

    if (gameState === 'playing') {
      return (
        <div className="bg-green-50 p-6 rounded-lg">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold mb-2">Faites votre choix !</h3>
            {countdown && <p className="text-lg text-orange-600">Temps restant: {countdown}s</p>}
            {myChoice && <p className="text-green-600 font-semibold">✅ Choix fait: {myChoice}</p>}
          </div>
          
          <div className="flex justify-center gap-6">
            {choices.map((choice) => (
              <button
                key={choice.value}
                onClick={() => makeChoice(choice.value)}
                disabled={!!myChoice}
                className={`
                  p-6 text-5xl rounded-lg border-2 transition-all
                  ${myChoice === choice.value ? 'border-green-500 bg-green-100' : 'border-gray-300'}
                  ${!myChoice ? 'hover:border-blue-300 hover:bg-blue-50 cursor-pointer' : ''}
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
              >
                <div className="text-center">
                  <div>{choice.emoji}</div>
                  <div className="text-sm mt-2 font-medium">{choice.label}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      );
    }

    if (gameState === 'results' && roundResults) {
      return (
        <div className="bg-yellow-50 p-6 rounded-lg">
          <h3 className="text-2xl font-bold text-center mb-4">Résultats du Round</h3>
          <div className="text-center">
            <p className="text-lg mb-2">
              <strong>Gagnant:</strong> {roundResults.winner || 'Égalité'}
            </p>
            <div className="grid grid-cols-2 gap-4 mt-4">
              {roundResults.choices?.map((player, index) => (
                <div key={index} className="bg-white p-3 rounded border">
                  <p className="font-semibold">{player.username}</p>
                  <p className="text-2xl">{player.choice}</p>
                </div>
              )) || <p>Chargement des résultats...</p>}
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Salon : {salonInfo?.name || 'Chargement...'}</h1>

      {/* INFOS SALON */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <p><strong>Nombre de manches :</strong> {salonInfo?.maxRounds}</p>
        <p><strong>Joueurs connectés :</strong> {joueurs.length} / {salonInfo?.maxPlayers}</p>
        {salonInfo && <p><strong>Round actuel :</strong> {salonInfo.currentRound} / {salonInfo.maxRounds}</p>}
        <p><strong>État :</strong> 
          <span className={`ml-2 px-2 py-1 rounded text-sm ${
            gameState === 'waiting' ? 'bg-gray-200' :
            gameState === 'playing' ? 'bg-green-200' :
            gameState === 'results' ? 'bg-yellow-200' :
            'bg-blue-200'
          }`}>
            {gameState === 'waiting' ? 'En attente' :
             gameState === 'playing' ? 'En jeu' :
             gameState === 'results' ? 'Résultats' :
             'Terminé'}
          </span>
        </p>
      </div>

      {/* 🎮 INTERFACE DE JEU */}
      <div className="mb-6">
        {renderGameInterface()}
      </div>

      {/* LISTE JOUEURS */}
      <div className="bg-gray-100 p-4 rounded shadow mb-6">
        <h2 className="text-xl font-semibold mb-2">Joueurs :</h2>
        <ul>
          {joueurs.map((j, i) => (
            <li className="flex items-center justify-between py-1" key={j._id || i}>
              <span>{j.username}</span>
              <span className={`text-sm ${j.ready ? 'text-green-600' : 'text-gray-500'}`}>
                {j.ready ? 'Prêt' : 'En attente'}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* CHAT */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <h2 className="text-xl font-semibold mb-2">Chat</h2>
        <div className="h-40 overflow-y-auto border p-2 mb-2 bg-gray-50 rounded">
          {chatMessages.map((msg, i) => (
            <p key={i}><strong>{msg.user} :</strong> {msg.text}</p>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            className="flex-1 border rounded px-2 py-1"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && envoyerMessage()}
            placeholder="Votre message..."
          />
          <Button onClick={envoyerMessage}>Envoyer</Button>
        </div>
      </div>

      {/* BOUTON PRET */}
      {gameState === 'waiting' && (
        <div className="text-center">
          <Button
            className={isReady ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}
            onClick={handleReady}
          >
            {isReady ? 'Annuler prêt' : 'Je suis prêt'}
          </Button>
        </div>
      )}
    </div>
  );
}

export default Salon;

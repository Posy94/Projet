import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import io from "socket.io-client";
import { useUser } from '../contexts/UserContext';

const socket = io("http://localhost:8000");

const Jeu = () => {
  
  const { user, loading } = useUser();
  const { salonId } = useParams();
  const [salon, setSalon] = useState(null);
  const [gameStatus, setGameStatus] = useState("waiting");
  const [isReady, setIsReady] = useState(false);
  const [hasChosen, setHasChosen] = useState(false);
  const [choice, setChoice] = useState(null);
  const [roundResult, setRoundResult] = useState(null);
  const [isAIGame, setIsAIGame] = useState(false);
  const [scores, setScores] = useState([0, 0]);
  const [gameEnded, setGameEnded] = useState(false);
  const [gameResult, setGameResult] = useState(null);

  const refreshUserStats = async () => {
    if (window.refreshUserStats) {
      window.refreshUserStats();
    }
  }

  useEffect(() => {
    console.log('🔴 SCORES CHANGED:', scores);
  }, [scores]);

  console.log('SALON DATA:', salon);
  console.log('PLAYERS DÉTAILLÉS:', salon?.players?.map(p => ({
  userId: p?.user?.id,
  username: p?.user?.username,
  ready: p?.ready,
  choice: p?.choice
  })));

  useEffect(() => {
    if (loading || !user) return

    socket.emit("joinSalon", {
      salonId,
      userId: user.id,
      username: user.username,
    });
  }, [socket, salonId, user, loading]);

  useEffect(() => {
    socket.on('salonUpdated', (salonData) => {
        console.log('SALON DATA:', salonData);        
        setSalon(salonData);

        const isAgainstAI = salonData.gameType === 'ai';
        setIsAIGame(isAgainstAI);
        console.log('🤖 Jeu contre IA ?', isAgainstAI);
        console.log('🤖 GameType:', salonData.gameType);        
    });

    socket.on("gameStart", ({ round, message }) => {
      console.log('🎮 GAME START REÇU !', { round, message });      
      setRoundResult(null);
      setIsReady(false);
      setHasChosen(false);
    });

    socket.on("nextRound", ({ round, scores }) => {
      console.log('🔄 NEXT ROUND COMPLET:', JSON.stringify({ round, scores }, null, 2));
      console.log('🔍 nextRound scores EXISTS?', !!scores);
      console.log('🔍 nextRound scores VALUE:', scores);

      setRoundResult(null);
      setIsReady(false);
      setHasChosen(false);
      setChoice(null);

      if (scores) {
        console.log('✅ NEXT ROUND - MISE À JOUR SCORES:', scores);
        setScores(scores);
      } else {
        console.log('❌ NEXT ROUND - AUCUN SCORES !');
      }
    });

    socket.on("roundResult", data => {
      console.log('🎯 ROUND RESULT COMPLET:', JSON.stringify(data, null, 2));
      console.log('🔍 data.scores EXISTS?', !!data.scores);
      console.log('🔍 data.scores VALUE:', data.scores);
      console.log('🔍 typeof data.scores:', typeof data.scores);

      setRoundResult(data);

      if (data.scores) {
        console.log('✅ TENTATIVE MISE À JOUR SCORES:', data.scores);
        setScores(prev => {
          console.log('📊 ANCIEN SCORES:', prev);
          console.log('📊 NOUVEAUX SCORES:', data.scores);
          return data.scores;
        });
      } else {
        console.log('❌ AUCUN SCORES DANS LA RÉPONSE !');
      }
    });

    socket.on("gameEnd", (data) => {
    console.log('🏁 GAME END REÇU:', data);
    
    let personalResult = 'unknown';

    // 🚨 FORCE LA CONVERSION EXPLICITE
    const winnerId = String(data.winnerId || '');
    const loserId = String(data.loserId || '');
    const userId = String(user?.id || '');
    
    console.log('🔍 CONVERSIONS FORCÉES:');
    console.log('   winnerId:', winnerId);
    console.log('   loserId:', loserId);
    console.log('   userId:', userId);
    
    if (winnerId && loserId && userId) {
        console.log('✅ ENTRÉE DANS LA CONDITION !');
        
        console.log('🔍 COMPARAISONS:');
        console.log('   userId === winnerId?', userId === winnerId);
        console.log('   userId === loserId?', userId === loserId);

        if (userId === winnerId) {
            personalResult = 'win';
            console.log('🏆 VICTOIRE !');
        } else if (userId === loserId) {
            personalResult = 'lose';
            console.log('💔 DÉFAITE !');
        }
    } else {
        console.log('❌ DONNÉES MANQUANTES après conversion');
    }

    console.log('🎯 RÉSULTAT FINAL:', personalResult);
    
    const gameEndData = {
        ...data,
        result: personalResult
    };

    setGameResult(gameEndData);
    setGameEnded(true);

    setTimeout(() => {
        refreshUserStats();
    }, 800);
});



    return () => {
      socket.off('salonUpdated');
      socket.off('gameStart');
      socket.off('roundResult');
      socket.off('nextRound');
      socket.off('gameEnd');
    };
  }, [socket]);

  const handleReady = () => {
    console.log('🟦 handleReady déclenché');
    console.log('🤖 Jeu contre IA ?', isAIGame);

    if (!socket.connected) {
      console.error('❌ Socket pas connecté !');
      return;
    }
  
    socket.emit('playerReady', {
      salonId: salon.salonId,
      userId: user.id,
      username: user.username
    });
    
    console.log(`🟦 Event playerReady envoyé !`); 
    setIsReady(true);
  };

  const handleChoice = (choice) => {
    if (hasChosen) return;

    console.log('🎯 DÉBUT handleChoice - paramètre reçu:', choice);
    console.log('🎯 CLIENT: Je vais envoyer le choix:', choice);
    console.log('🎯 CLIENT: salonId:', salonId);
    console.log('🎯 CLIENT: userId:', user?.id);

    if (!choice || !user) {
        console.error('❌ Choix ou utilisateur manquant !', { choice, user });
        return;
    }

    socket.emit("playerChoice", {
      salonId: salonId,
      userId: user.id,
      choice: choice
    });

    console.log('🎯 CLIENT: Choix envoyé !');
    setChoice(choice);
    setHasChosen(true);
  };

  const getResultMessage = () => {
  switch(gameResult?.result) {
    case 'win': return '🏆 VICTOIRE !';
    case 'draw': return '🤝 ÉGALITÉ !';
    case 'lose': return '💔 DÉFAITE !';
    default: return '🤔 Résultat inconnu';
  }
};

  if (!salon) return <div className="text-center mt-10">Chargement du salon...</div>

  console.log('🔍 SALON BRUT:', salon);
  console.log('🔍 TOUS LES PLAYERS:', salon?.players);
  console.log('🔍 PLAYERS DÉTAIL:', salon?.players?.map((p, i) => ({
    index: i,
    hasUser: !!p?.user,
    username: p?.user?.username,
    userId: p?.user?._id,
    rawPlayer: p
  })));

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-center mb-4">Salon : {salon?.name || 'Chargement...'}</h2>

      <div className="grid grid-cols-2 gap-4 mb-6">
        {salon?.players
          ?.filter(p => {
            console.log('🔍 PLAYER CHECK:', p);
            return p?.user && p?.user?._id;
          })
          ?.map((p, index) => {
            const displayName = p.user.username;
            const playerId = p.user._id;

          return (
            <div
              key={playerId}
              className={`p-4 rounded shadow ${playerId === user.id ? "bg-blue-100" : "bg-gray-100"}`}
            >
              <p className="font-semibold">{displayName}</p>
              <p className="text-sm">Prêt : {p.ready ? "✅" : "❌"}</p>
              <p className="text-sm">Choix : {p.choice ? "✔️" : "⏳"}</p>
            </div>
          );
        })}
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
            <p className="text-yellow-600 font-medium">{isAIGame ? "🤖 L'IA se prépare..." : "En attente de l'autre joueur..."}</p>
          )}
        </div>
      )}

      {salon?.status === "playing" && (
        <div className="text-center">
          {!hasChosen ? (
            <>
              <p className="mb-2">Faites votre choix :</p>
              <div className="flex justify-center gap-4">
                {["rock", "paper", "scissors"].map(item => (
                  <button
                    key={item}
                    onClick={() => handleChoice(item)}
                    disabled={hasChosen}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 capitalize"
                  >
                    {item === "rock" ? "🪨" : item === "paper" ? "📄" : "✂️"} {item}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <p className="mt-4 text-blue-700 font-medium">
              {isAIGame ? "🤖 Fin du round..." : "En attente de l'autre joueur..."}
            </p>
          )}
        </div>
      )}

      {roundResult && (
        <div className="mt-6 text-center">
          <h3 className="text-xl font-bold">Résultat du Round</h3>

          <p className="text-lg">
            {roundResult.result === "draw"
                ? "Egalité, personne ne gagne ce round !"
                : salonId
                ? // MODE PVP - VERIFIER QUI A GAGNE
                  (() => {
                  console.log('🔍 ROUND RESULT COMPLET:', roundResult);
                  console.log('🔍 roundResult.result:', roundResult.result);
                  console.log('🔍 salon.players:', salon?.players);
                  const winnerId = roundResult.result;
                  const winner = salon?.players?.find(p => {
                    console.log('🔍 COMPARAISON:', {
                      playerUserId: p?.user?._id,
                      playerUserId2: p?.userId,
                      winnerId: winnerId,
                      match1: (p?.user?._id === winnerId),
                      match2: (p?.userId === winnerId)
                    });
                    return (p?.user?._id || p?.userId) === winnerId;
                  });

                  console.log('🔍 WINNER TROUVÉ:', winner);
                  const winnerName = winner?.user?.username || winner?.username || 'Joueur';
                  console.log('🔍 WINNER NAME:', winnerName);

                  return winnerId === user?.id
                    ? "🎉 Vous gagnez ce round !"
                    : `${winnerName} gagne ce round !`;
                })()
                : // MODE IA
                  roundResult.result === "player1"
                  ? "🎉 Vous gagnez ce round !"
                  : "🤖 L'IA gagne ce round !"
            }
          </p>

          <div className="mt-2">
            <h4 className="font-semibold mb-2">Choix des jouers :</h4>
              {roundResult.choices?.map(c => {
                const playerInfo = c.userId === 'AI'
                  ? { name: '🤖 IA', isCurrentUser: false }
                  : (() => {
                    const player = salon?.players?.find(p => 
                    (p?.user?._id || p?.userId) === c.userId
                    );
                    const name = player?.user?.username || player?.username || 'Joueur';
                    const isCurrentUser = c.userId === user?.id;
                    return {
                      name: isCurrentUser ? '👤 Vous' : name,
                      isCurrentUser
                    }
                  })();
                return (
                  <p key={c.userId} className={`text-lg ${playerInfo.isCurrentUser ? 'font-bold text-blue-600' : ''}`}>
                    {playerInfo.name}: {c.choice === "rock" ? "🪨" : c.choice === "paper" ? "📄" : "✂️"}
                  </p>
                );
              })}
          </div>
        </div>
      )}

      <div>
        <h3>📊 Scores</h3>
        {salonId && salon?.players ? (
          // Mode PVP avec vérification
          <p>
            {salon.players[0]?.user?.username || 'Joueur 1'}: {scores[0] || 0} -
            {salon.players[1]?.user?.username || 'Joueur 2'}: {scores[1] || 0}
          </p>
        ) : (
          // Mode IA
          <p>Vous: {scores[0] || 0} - IA: {scores[1] || 0}</p>
        )}
        <p>🎯 Premier à 3 victoires gagne !</p>
      </div>


      {gameStatus === "finished" && (
        <div className="mt-8 text-center text-green-700 font-semibold">
          🎉 Partie terminée !
        </div>
      )}

      {gameEnded && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-2xl text-center shadow-2xl max-w-md mx-4">
            <h2 className='text-3xl font-bold mb-4'>
              {getResultMessage()}
            </h2>
            <p className='text-lg mb-6 text-gray-700'>{gameResult?.message}</p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => window.location.href = '/'}
                className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-colors"
              >
                Quitter
              </button>
              <button
                onClick={() => console.log('REJOUER')}
                className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-colors"
              >
                Rejouer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Jeu

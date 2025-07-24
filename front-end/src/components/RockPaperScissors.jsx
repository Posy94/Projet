import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const RockPaperScissors = ({ salonId, userId, username }) => {
    const [socket, setSocket] = useState(null);
    const [salon, setSalon] = useState(null);
    const [myChoice, setMyChoice] = useState(null);
    const [gameState, setGameState] = useState('waiting'); // WAITING CAR ON ATTEND LES RESULTATS DU JEU
    const [countdown, setCountdown] = useState(null);
    const [isReady, setIsReady] = useState(false);

    // CONNEXION WEBSOCKET
    useEffect(() => {
        const newSocket = io('http://localhost:8000');
        setSocket(newSocket);

        // REJOINDRE LE SALON
        newSocket.emit('joinSalon', { salonId, userId, username });

        // ECOUTE DE LA MISE A JOUR DU SALON
        newSocket.on('salonUpdated', (updatedSalon) => {
            setSalon(updatedSalon);
        });

        // ECOUTE LE DEBUT DU ROUND
        newSocket.on('roundStart', ({ roundNumber, countdown: countdownTime }) => {
            setGameState('playing');
            setMyChoice(null);
            setCountdown(countdownTime);
        });

        // ECOUTE DU RESULTAT
        newSocket.on('roundResult', (result) => {
            setGameState('results');
            // AFFICHE LES RESULTATS
        });

        return () => newSocket.close();
    }, [salonId, userId, username]);

    // INDIQUE QU'ON EST PRET
    const handleReady = () => {
        socket.emit('playerReady', { salonId, userId });
        setIsReady(true);
    };

    // FAIRE UN CHOIX
    const makeChoice = (choice) => {
        if (gameState !== 'playing' || myChoice) return;
        
        setMyChoice(choice);
        socket.emit('makeChoice', { salonId, userId, choice });
    };

    // INTERFACE DE JEU
    const renderGameChoices = () => {
        const choices = [
            { value: 'rock', emoji: '🪨', label: 'Pierre' },
            { value: 'paper', emoji: '📄', label: 'Papier' },
            { value: 'scissors', emoji: '✂️', label: 'Ciseaux' }
        ];

        return (
            <div className="flex justify-center gap-4 my-8">
                {choices.map((choice) => (
                    <button
                        key={choice.value}
                        onClick={() => makeChoice(choice.value)}
                        disabled={gameState !== 'playing' || !!myChoice}
                        className={`
                            p-6 text-6xl rounded-lg border-2 transition-all
                            ${myChoice === choice.value ? 'border-blue-500 bg-blue-100' : 'border-gray-300'}
                            ${gameState === 'playing' && !myChoice ? 'hover:border-blue-300 cursor-pointer' : ''}
                            disabled:opacity-50 disabled:cursor-not-allowed
                        `}
                    >
                        <div className="text-center">
                            <div>{choice.emoji}</div>
                            <div className="text-sm mt-2">{choice.label}</div>
                        </div>
                    </button>
                ))}
            </div>
        );
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold text-center mb-8">
                Pierre - Feuille - Ciseaux
            </h1>

            {/* INFORMATION DU SALON */}
            {salon && (
                <div className="bg-gray-100 p-4 rounded-lg mb-6">
                    <h2 className="text-xl font-semibold">{salon.name}</h2>
                    <p>Round {salon.currentRound} / {salon.maxRounds}</p>
                    <p>Joueurs: {salon.players?.length || 0} / {salon.maxPlayers}</p>
                    <p>Statut: {salon.status}</p>
                </div>
            )}

            {/* LISTE DES JOUEURS */}
            {salon?.players && (
                <div className="grid grid-cols-2 gap-4 mb-6">
                    {salon.players.map((player, index) => (
                        <div key={index} className="bg-white p-4 rounded-lg border">
                            <h3 className="font-semibold">{player.user?.username || 'Joueur'}</h3>
                            <p className="text-sm">
                                {player.ready ? '✅ Prêt' : '⏳ En attente'}
                            </p>
                        </div>
                    ))}
                </div>
            )}

            {/* INTERFACE SELON L'ETAT DE LA VARIABLE GAMESTATE */}
            {gameState === 'waiting' && !isReady && (
                <div className="text-center">
                    <button
                        onClick={handleReady}
                        className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600"
                    >
                        Je suis prêt !
                    </button>
                </div>
            )}

            {gameState === 'waiting' && isReady && (
                <div className="text-center">
                    <p className="text-lg">En attente des autres joueurs...</p>
                </div>
            )}

            {gameState === 'playing' && (
                <div>
                    <div className="text-center mb-6">
                        <h3 className="text-2xl font-bold">Faites votre choix !</h3>
                        {countdown && <p className="text-xl">Temps restant: {countdown}s</p>}
                        {myChoice && <p className="text-green-600">Choix fait: {myChoice}</p>}
                    </div>
                    {renderGameChoices()}
                </div>
            )}
        </div>
    );
};

export default RockPaperScissors;

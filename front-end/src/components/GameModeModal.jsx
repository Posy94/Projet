const GameModeModal = ({ onClose, onPublicSalon, onPrivateInvite }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full">

                <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-t-2xl">
                    <h2 className="text-xl font-bold text-center">Mode multijouer</h2>
                </div>

                <div className="p-6 space-y-4">

                    {/* SALONPUBLIC */}
                    <button
                    onClick={onPublicSalon}
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
                    >
                        <div className="flex items-center justify-center space-x-3">
                            <span className="text-2xl">🌍</span>
                            <div className="text-left">
                                <div className="text-lg">Salon public</div>
                                <div className="text-sm poacity-90">Attendre un adversaire</div>
                            </div>
                        </div>
                    </button>

                    {/* INVITATION PRIVEE */}
                    <button
                    onClick={onPrivateInvite}
                    className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
                    >
                        <div className="flex items-center justify-center space-x-3">
                            <span className="text-2xl">📨</span>
                            <div className="text-left">
                                <div className="text-lg">Inviter un ami</div>
                                <div className="text-sm opacity-90">Choisir un adversaire</div>
                            </div>
                        </div>
                    </button>

                    {/* ANNULER */}
                    <button
                        onClick={onClose}
                        className="w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-xl transition-colors"
                    >
                        Annuler
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GameModeModal;
const SalonsModel = require('../models/salons.model');

const cleanupAbandonedSalons = async () => {
    try {
        const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
        
        // Supprimer salons en 'waiting' depuis + 2min
        const result = await SalonsModel.deleteMany({
            status: 'waiting',
            createdAt: { $lt: twoMinutesAgo }
        });
        
        if (result.deletedCount > 0) {
            console.log(`🧹 ${result.deletedCount} salons abandonnés supprimés`);
        }
    } catch (error) {
        console.error('❌ Erreur cleanup salons:', error);
    }
};

// Lancer toutes les 30 secondes
setInterval(cleanupAbandonedSalons, 30000);

module.exports = { cleanupAbandonedSalons };

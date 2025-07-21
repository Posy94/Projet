const mongoose = require('mongoose');

// SCHEMA POUR LES TYPES DE RECOMPENSES/BADGES DISPONIBLES
const recompenseDefinitionSchema = new mongoose.Schema(
    {
        id: {
            type: String,
            required: true,
            unique: true
        },
        name: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        category: {
            type: String,
            enum: ['progression', 'victoires', 'series', 'assiduite', 'specialisation'],
            required: true
        },
        icon: {
            type: String,
            required: true
        },
        color: {
            type: String,
            required: true
        },
        conditions: {
            type: {
                type: String,
                enum: ['parties_jouees', 'victoires', 'serie_victoires', 'jours_consecutifs', 'victoires_coup', 'victoires_equilibrees'],
                required: true
            },
            value: {
                type: Number,
                required: true
            },
            movePlayed: {
                type: String,
                enum: ['pierre', 'feuille', 'Ciseaux'],
                required: false
            }
        },
        points: {
            type: Number,
            default: true
        },
        active: {
            type: Boolean,
            default: true
        }
    }, { timestamp: true }
);

// SCHEMA POUR LES RECOMPENSES DEBLOQUEES PAR LES UTILISATEURS
const userRecompenseSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    recompenseId: {
        type: String,
        required: true
    },
    unlockedTime: {
        type: Date,
        default: Date.now
    },
    progression: {
        type: Number,
        default: 0,
        min: 0,
        max: 1
    }
}, { timestamp: true }
);

// INDEX POUR EVITER LES DOUBLONS
userRecompenseSchema.index({ userId: 1, recompenseId: 1 }, { unique: true });

const RecompenseDefinition = mongoose.model('RecompenseDefinition', recompenseDefinitionSchema);
const UserRecompense = mongoose.model('UserRecompense', userRecompenseSchema);

// METHODES STATIQUES POUR INITIALISER LES RECOMPENSES PAR D2FAUT
RecompenseDefinition.initializerRecompensesByDefault = async function() {
    const recompensesByDefault = [
        {
            id: 'premiere-victoire',
            name: 'Premiere Victoire',
            description: 'Remportez votre premier match',
            category: 'progression',
            icon: 'trophy',
            color: 'bg-yellow-500',
            conditions: { type: 'victoires', value: 1 },
            points: 10
        },
        {
            id: 'debutant',
            name: 'Débutant',
            description: 'Jouez 10 parties',
            category: 'progression',
            icon: 'star',
            color: 'bg-blue-500',
            conditions: { type: 'parties_jouees', value: 10 },
            points: 15
        },
        {
            id: 'veteran',
            name: 'Vétéran',
            description: 'Jouez 100 parties',
            category: 'progression',
            icon: 'award',
            color: 'bg-purple-500',
            conditions: { type: 'parties_jouees', value: 100 },
            points: 50
        },
        {
            id: 'serie-5',
            name: 'Série de 5',
            description: 'Gagnez 5 partie consécutives',
            category: 'series',
            icon: 'zap',
            color: 'bg-orange-500',
            conditions: { type: 'series_victoires', value: 5 },
            points: 25
        },
        {
            id: 'imparable',
            name: 'Imparable',
            description: 'Gagnez 10 parties consécutives',
            category: 'series',
            icon: 'target',
            color: 'bg-red-500',
            conditions: { type: 'serie_victoires', value: 10 },
            points: 50
        },
        {
            id: 'joueur-quotidien',
            name: 'Joueur Quotidien',
            description: 'Jouez 3 jours consécutifs',
            category: 'assiduite',
            icon: 'calendar',
            color: 'bg-green-500',
            conditions: { type: 'jours_consecutifs', value: 3 },
            points: 20
        },
        {
            id: 'maitre-pierre',
            name: 'Maitre de la Pierre',
            description: 'Gagnez 20 parties avec Pierre',
            category: 'specialisation',
            icon: 'shield',
            color: 'bg-gray-600',
            conditions: { type: 'victoires_coup', value: 20, movePlayed: 'pierre' },
            points: 30
        },
        {
            id: 'maitre-feuille',
            name: 'Maitre de la Feuille',
            description: 'Gagnez 20 parties avec Feuille',
            category: 'specialisation',
            icon: 'leaf',
            color: 'bg-green-600',
            conditions: { type: 'victoires_coup', value: 20, movePlayed: 'feuille' },
            points: 30
        },
        {
            id: 'maitre-ciseaux',
            name: 'Maitre des Ciseaux',
            description: 'Gagnez 20 parties avec Ciseaux',
            category: 'specialisation',
            icon: 'scissors',
            color: 'bg-red-600',
            conditions: { type: 'victoires_coup', value: 20, movePlayed: 'ciseaux' },
            points: 30
        },
        {
            id: 'equilbre',
            name: 'Equilibré',
            description: 'Gagnez au moins 10 parties avec chaque coup',
            category: 'specialisation',
            icon: 'balance',
            color: 'bg-indigo-600',
            conditions: { type: 'victoires_equilibrees', value: 10 },
            points: 40
        }
    ];

    for (const recompense of recompensesByDefault) {
        await this.findOneAndUpdate(
            { id: recompense.id },
            recompense,
            { upsert: true, new: true }
        );
    }
};

module.exports = { RecompenseDefinition, UserRecompense };
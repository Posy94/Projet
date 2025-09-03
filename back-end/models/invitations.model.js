const mongoose = require('mongoose');

const invitationsSchema = mongoose.Schema(
    {
        salonId: {
            type: String,
            required: true
        },
        fromUser: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'users',
            required: true
        },
        toUser: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'users',
            required: true
        },
        status: {
            type: String,
            enum: ['pending', 'accepted', 'declined', 'expired'],
            default: 'pending'
        },
        expiresAt: {
            type: Date,
            default: () => new Date(Date.now() + 2 * 60 * 1000)
        },
        createdAt: {
            type: Date,
            default: Date.now
        },
        respondedAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

// INDEX POUR AUTO-SUPPRESSION DES INVITATIONS EXPIREES
invitationsSchema.index({ expiresAt: 1 }, { expiresAfterSeconds: 0 });

// INDEX COMPOSITE POUR LES REQUETES
invitationsSchema.index({ fromUser: 1, toUser: 1, status: 1 });
invitationsSchema.index({ toUser: 1, status: 1 });

// METHODES STATIQUES
invitationsSchema.statics.getPendingInvitation = function(fromUserId, toUserId) {
    return this.findOne({
        fromUser: fromUserId,
        toUser: toUserId,
        status: 'pending',
        expiresAt: { $gt: new Date() }
    });
};

invitationsSchema.statics.getUserPendingInvitations = function(userId) {
    return this.find({
        toUser: userId,
        status: 'pending',
        expiresAt: { $gt: new Date() }
    }).populate('fromUser', 'username avatar');
};

invitationsSchema.statics.expireOldInvitations = function() {
    return this.updateMany(
        {
            status: 'pending',
            expiresAt: { $lt: new Date() }
        },
        {
            status: 'expired',
            updatedAt: new Date()
        }
    );
};

// METHODE POUR DECLINER UNE INVITATION
invitationsSchema.methods.decline = function() {
    this.status = 'declined';
    this.respondedAt = new Date();
    return this.save();
};

module.exports = mongoose.model('invitations', invitationsSchema);
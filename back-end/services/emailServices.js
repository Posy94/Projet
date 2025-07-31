const nodemailer = require('nodemailer');
const crypto = require('crypto');

// ↓ DEBUG COMPLET
console.log('🔍 === DEBUG VARIABLES EMAIL ===');
console.log('EMAIL_HOST:', process.env.EMAIL_HOST);
console.log('EMAIL_PORT:', process.env.EMAIL_PORT);
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS:', process.env.EMAIL_PASS);
console.log('=================================');

class EmailService {
    constructor() {
        console.log('🔧 Configuration transporter avec:');
        console.log('Host:', process.env.EMAIL_HOST);
        console.log('Port:', parseInt(process.env.EMAIL_PORT));
        console.log('User:', process.env.EMAIL_USER);
        console.log('Pass:', process.env.EMAIL_PASS ? 'DÉFINI' : 'UNDEFINED');

        this.transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: parseInt(process.env.EMAIL_PORT),
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    }

    // GENERER TOKEN D'ACTIVATION
    generateActivationToken() {
        return crypto.randomBytes(32).toString('hex');
    }

    // ENVOYER EMAIL D'ACTIVATION
    async sendActivationEmail(user, activationToken) {

        console.log('🔍 === DEBUG EMAIL ===');
        console.log('user reçu:', user);
        console.log('user.email:', user.email);
        console.log('type de user:', typeof user);
        console.log('========================');

        const recipientEmail = typeof user === 'string' ? user : user.email;

        console.log('📧 Email final pour envoi:', recipientEmail);

        const activationUrl = `http://localhost:8000/api/auth/activate/${activationToken}`;

        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to: recipientEmail,
            subject: '🎯 Activez votre compte - Ton App',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h1 style="color: #4F46E5;">🎉 Bienvenue !</h1>

                    <p>Merci de vous être inscrit sur notre plateforme !</p>

                    <p>Pour activer votre compte et commencer à utiliser l'application, cliquez sur le lien ci-dessous !</p>

                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${activationUrl}"
                            style="background-color: #4F46E5; color: white; padding: 15px 30px;
                                text-decoration: none; border-radius: 8px; display: inline-block;">
                            ✅ ACTIVER MON COMPTE
                        </a>
                    </div>

                    <p><small>Ce lien expire dans 24 heures.</small></p>

                    <p>Si vous n'arrivez pas à cliquer, copiez ce lien dans votre navigateur :</p>
                    <p><code>${activationUrl}</code></p>

                    <hr>
                    <p><small>Si vous n'êtes pas à l'origine de cette inscription, ignorez cet email.</small></p>
                </div>
            `
        };

        console.log('📋 mailOptions.to:', mailOptions.to);

        try {
            // Vérifier la connexion AVANT d'envoyer
            console.log('📨 Envoi en cours...');
            console.log('🔗 URL d\'activation:', activationUrl);            
            const result = await this.transporter.sendMail(mailOptions);
            console.log('✅ EMAIL ENVOYÉ !', result);
            return result;
            
        } catch (error) {
            console.error('❌ ERREUR EMAIL COMPLÈTE:', error);
            console.error('❌ Message:', error.message);
            console.error('❌ Code:', error.code);
            throw new Error(`Erreur email: ${error.message}`);
        }
    }
}

module.exports = new EmailService();
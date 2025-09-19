const jwt = require('jsonwebtoken');
const ENV = require('../config/env')
const createError  = require ('./error')
const UsersModel = require ('../models/users.model');

const verifieToken = (req, res, next) => {
// Récupère le jeton (token) JWT à partir des cookies de la requête
  console.log("🔍 Cookies reçus :", req.cookies);  
  let token = req.cookies.token;

// SI PAS DE TOKEN DANS LES COOKIES, CHERCHE DANS LES HEADERS
if (!token) {
  const authHeader = req.headers.authorization;
  console.log("🔍 Authorization header :", authHeader);

  if (authHeader && authHeader.startsWith('Bearer')) {
    token = authHeader.substring(7);
    console.log("✅ Token trouvé dans headers");
  }
} else {
  console.log("✅ Token trouvé dans cookies");
}

// SI TOUJOURS PAS DE TOKEN, ERREUR
  if(!token) {
    console.log("❌ Aucun token trouvé");    
    return next(createError(401, "Acces Denied"));
  }

// Vérifier la validité du jeton en utilisant jwt.verify
  try {
    const verified = jwt.verify(token, process.env.TOKEN_SIGNATURE);
    console.log("✅ Token vérifié:", verified);    
    req.user = { id: verified.userId };
    next();
  } catch (error) {
    console.log("❌ Token invalide:", error.message);
    next(createError(401, "Token invalide"));
  }
}

// ✅ NOUVELLE FONCTION POUR WEBSOCKET
const verifieTokenSocket = (token) => {
  if (!token) {
    throw new Error("Aucun token fourni");
  }

  try {
    const verified = jwt.verify(token, process.env.TOKEN_SIGNATURE);
    console.log("✅ Token vérifié pour WebSocket:", verified);
    return { userId: verified.userId }; // ✅ Retourne l'objet user
  } catch (error) {
    console.log("❌ Token invalide pour WebSocket:", error.message);
    throw new Error("Token invalide");
  }
};

// MIDDLEWARE POUR LES ROLES
const verifieRole = (rolesAutorises) => {
  return async (req, res, next) => {
    try {
      console.log("🔍 Vérification rôle pour user:", req.user.id);
      
      // Récupère l'utilisateur depuis la DB
      const user = await UsersModel.findById(req.user.id);
      
      if (!user) {
        console.log("❌ Utilisateur non trouvé");
        return next(createError(404, "Utilisateur non trouvé"));
      }
      
      console.log("👤 Rôle utilisateur:", user.role);
      console.log("🎭 Rôles autorisés:", rolesAutorises);
      
      // Vérifie si le rôle est autorisé
      if (!rolesAutorises.includes(user.role)) {
        console.log("❌ Accès refusé - rôle insuffisant");
        return next(createError(403, "Accès refusé - privilèges insuffisants"));
      }
      
      // ✅ Ajoute le rôle à req pour utilisation ultérieure
      req.user.role = user.role;
      console.log("✅ Accès autorisé pour rôle:", user.role);
      next();
      
    } catch (error) {
      console.error("❌ Erreur vérification rôle:", error);
      next(createError(500, "Erreur lors de la vérification des privilèges"));
    }
  };
};

// MIDDLEWARE POUR ADMIN/MODERATEUR
const verifieAdminOuModo = verifieRole(['admin', 'moderateur']);

module.exports = verifieToken;
module.exports.verifieTokenSocket = verifieTokenSocket;
module.exports.verifieRole = verifieRole;
module.exports.verifieAdminOuModo = verifieAdminOuModo;
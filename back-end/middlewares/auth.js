const jwt = require('jsonwebtoken');
const ENV = require('../config/env')
const createError  = require ('./error')

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

module.exports = verifieToken;
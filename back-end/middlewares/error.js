const createError = (status, message) => {
    // Crée une nouvelle instance d'erreur vide
    const error = new Error()
    // Définit le code d'état de l'erreur 
      // en  fonction du paramètre "status"
    error.status = status
    // Définit le message d'erreur 
      // en fonction du paramètre "message"
    error.message = message
    // Renvoie l'instance d'erreur personnalisée
    return error
  }
  
  module.exports = createError;
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useState } from "react";
import axios from 'axios';

function Inscription({ setUser }) {
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm();

    const [error, setError] = useState('');
    const [isLoading, setIsloading] = useState(false);
    const navigate = useNavigate();

    const onSubmit = async (data) => {
        setError('');
        setIsloading(true);

        try {
            const response = await axios.post(
                "http://localhost:8000/api/auth/register",
                {
                    username: data.pseudo,
                    email: data.email,
                    password: data.password
                },
                { withCredentials: true }
            );

            setUser(response.data.user);
            navigate("/ListeSalons");
            
        } catch (error) {
            console.error("Erreur complète:", error);
            console.error("Status :", error.response?.status);
            console.error("Data :", error.response?.data);
            
            if (error.response) {
                const status = error.response.status;
                const errorMessage = error.response.data?.message || error.response.data?.error;

                if (status === 409) {
                    setError("Cet email ou nom d'utilisateur est déjà utilisé. Veuillez en choisir un autre.");
                } else if (status === 400) {
                    setError("Données invalides. Vérifiez vos informations.");
                } else {
                    setError(errorMessage || "Erreur lors de l'inscription");
                }
            } else if (error.request) {
                setError("Erreur de connexion au serveur. Vérifiez votre connexion");
            } else {
                setError("Une erreur inattendue s'est produite.");
            }
        } finally {
            setIsloading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-md mt-10">
            <h2 className="text-2xl font-bold mb-4 text-center">Inscription</h2>

            {/* Affichage de l'erreur */}
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                    <input
                    className="w-full border px-4 py-2 rounded"
                    type="text"
                    placeholder="Pseudo"
                    {...register("pseudo", { required: "Pseudo requis" })}
                    />
                    {errors.pseudo && (
                        <p className="text-red-500 text-sm mt-1">{errors.pseudo.message}</p>
                    )}
                </div>

                <div>
                    <input
                    className="w-full border px-4 py-2 rounded"
                    type="email"
                    placeholder="Email"
                    {...register("email", { required: "Email requis", pattern: { value: /^\S+@\S+$/i, message: "Format d'email invalide", } })}
                    />
                    {errors.email && (
                        <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                    )}
                </div>

                <div>
                    <input
                    className="w-full border px-4 py-2 rounded"
                    type="password"
                    placeholder="Mot de passe"
                    {...register("password", { required: "Mot de passe requis", minLength: { value: 6, message: "Mot de passe trop court (min. 6 caractères)", }, })}
                    />
                    {errors.password && (
                        <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
                    )}
                </div>

                <div>
                    <input
                    className="w-full border px-4 py-2 rounded"
                    type="password"
                    placeholder="Confirmation du mot de passe"
                    {...register("confirmation", { required: "Confirmation requise", validate: (value) => value === watch("password") || "Les mots de passe ne correspondent pas", })}
                    />
                    {errors.confirmation && (
                        <p className="text-red-500 text-sm mt-1">{errors.confirmation.message}</p>
                    )}
                </div>
                
                
                <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                    Créer un compte
                </button>
            </form>
            <p className="mt-4 text-center text-sm">
                Déjà un compte ? <Link to="/connexion" className="text-blue-600 hover:underline">Se connecter</Link>
            </p>
        </div>
    );
};

export default Inscription;
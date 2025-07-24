import { Link } from "react-router-dom";
import { useForm } from "react-hook-form"
import axios from 'axios';

function Connexion({ setUser }) {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    const onSubmit = async (data) => {
        try {
            console.log("Données envoyées :", data);
            const response = await axios.post(
                "http://localhost:8000/api/user/login",
                data,
                { withCredentials: true,}
            );

            const result = response.data

            setUser(result.user)

            window.location.href = "/listeSalons";
        } catch (error) {
            console.error("Erreur complète :", error.response);
            if (error.response?.data?.message) {
                alert(error.response.data.message);
            } else {
                alert(error.message || "Erreur de connexion");
            }
        }  
    };

    return (
        <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-md mt-10">
            <h2 className="text-2xl font-bold mb-4 text-center">Connexion</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                    <input
                        className="w-full border px-4 py-2 rounded"
                        type="email"
                        placeholder="Email"
                        {...register("email", {
                            required: "Email requis",
                            pattern: {
                                value: /^\S+@\S+$/i,
                                message: "Format d'email invalide",
                            },
                        })}
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
                        {...register("password", { required: "Mot de passe requis" })}
                    />
                    {errors.password && (
                        <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
                    )}
                </div>
                <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                    Se connecter
                </button>                
            </form>
            <p className="mt-4 text-center text-sm">
                Pas encore de compte ? <Link to="/inscription" className="text-blue-600 hover:underline">Créer un compte</Link>
            </p>
        </div>
    );
}

export default Connexion;
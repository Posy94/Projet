import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";

function Inscription({ setUser }) {
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm();

    const onSubmit = async (data) => {
        try {
            const response = await axios.post(
                "http://localhost:5000/api/users/register",
                {
                    username: data.pseudo,
                    email: data.email,
                    password: data.password
                },
                { withCredentials: true }
            );

            const result = await response.json();

            setUser(result.user);
            window.location.href = "/listeSalons";
        } catch (error) {
            console.error("Erreur :", error.message);
            alert(error.message || "Erreur d'inscription")
        }
    };

    return (
        <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-md mt-10">
            <h2 className="text-2xl font-bold mb-4 text-center">Inscription</h2>
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
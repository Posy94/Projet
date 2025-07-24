import { useState } from "react";

function CreationSalon() {
    const [form, setForm] = useState({
        name: "",
        maxPlayers: 2,
        maxRounds: 3,
    });

    const [message, setMessage] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch("http://localhost:8000/api/salons/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials:'include',
                body: JSON.stringify(form),
            });

            if (response.ok) {
                const data = await response.json();
                console.log("✅ Salon créé avec succès :", data);
            } else {
                const errorData = await response.json();
                console.error("❌ Erreur serveur :", response.status, errorData);                
            }
        } catch (error) {
            setMessage("❌ Erreur réseau :", error);
        }
    };

    return (
        <div className="max-w-md mx-auto p-6 bg-white rounded shadow mt-10">
            <h2 className="text-xl font-bold mb-4 text-center">Créer un salon</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input
                    className="w-full border px-4 py-2 rounded"
                    type="text"
                    name="name"
                    placeholder="Nom du salon"
                    value={form.name}
                    onChange={handleChange}
                    required
                />

                <input
                    className="w-full border px-4 py-2 rounded"
                    type="number"
                    name="maxPlayers"
                    placeholder="Nombre de joueurs"
                    value={form.maxPlayers}
                    onChange={handleChange}
                    min={2}
                    max={2}
                    required
                />

                <input
                    className="w-full border px-4 py-2 rounded"
                    type="number"
                    name="maxRounds"
                    placeholder="Nombre de manches"
                    value={form.maxRounds}
                    onChange={handleChange}
                    min={1}
                    max={10}
                    required
                />
                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                >
                    Créer le salon
                </button>
            </form>
            {message && <p className="mt-4 text-center text-sm text-green-600">{message}</p>}
        </div>
    );
}

export default CreationSalon;
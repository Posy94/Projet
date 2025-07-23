import React from "react";

const Cgu = () => {
    return (
        <div className="container mx-auto p-6 max-w-3xl">
            <h1 className="text-3xl font-bold mb-6">Conditions générales d'utilisation</h1>

            <section className="mb-4">
                <h2 className="text-xl font-semibold mb-2">1. Objet</h2>
                <p>
                    Ces conditions définissent les règles d'utilisation du jeu en ligne Pierre-Feuille-Ciseaux, accessible via notre plateforme.
                </p>
            </section>

            <section className="mb-4">
                <h2 className="text-xl font-semibold mb-2">2. Accès au jeu</h2>
                <p>
                    Le jeu est accessible gratuitement à toute personne disposant d'un accès à Internet. Certaines fonctionnalités nécessitent une inscription.
                </p>
            </section>

            <section className="mb-4">
                <h2 className="text-xl font-semibold mb-2">3. Règles de conduite</h2>
                <p>
                    Les joueurs s’engagent à adopter un comportement respectueux envers les autres utilisateurs. Tout comportement abusif entraînera une suspension de compte.
                </p>
            </section>

            <section className="mb-4">
                <h2 className="text-xl font-semibold mb-2">4. Données personnelles</h2>
                <p>
                    Vos données sont utilisées uniquement pour le fonctionnement du jeu. Aucune donnée ne sera vendue ou partagée sans votre consentement.
                </p>
            </section>

            <section className="mb-4">
                <h2 className="text-xl font-semibold mb-2">5. Modifications</h2>
                <p>
                    Ces CGU peuvent être modifiées à tout moment. Les utilisateurs seront notifiés en cas de changement significatif.
                </p>
            </section>
        </div>
    );
};

export default Cgu;
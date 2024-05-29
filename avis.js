export function ajoutListenersAvis() {
  const piecesElements = document.querySelectorAll(".fiches article button");

  for (let i = 0; i < piecesElements.length; i++) {
    piecesElements[i].addEventListener("click", async function (event) {
      const id = event.target.dataset.id;
      const response = await fetch(`http://localhost:8081/pieces/${id}/avis`);
      const avis = await response.json();
      window.localStorage.setItem(`avis-pieces-${id}`, JSON.stringify(avis));

      const pieceElement = event.target.parentElement;
      afficherAvis(pieceElement, avis);
    });
  }
}

export function afficherAvis(pieceElement, avis) {
  const avisElement = document.createElement("p");

  for (let i = 0; i < avis.length; i++) {
    avisElement.innerHTML += `<b>${avis[i].utilisateur}:</b> ${avis[i].commentaire} <br>`;
  }
  pieceElement.appendChild(avisElement);
}

export function ajoutListenersEnvoyerAvis() {
  const formulaireAvis = document.querySelector(".formulaire-avis");
  formulaireAvis.addEventListener("submit", (e) => {
    e.preventDefault();

    const avis = {
      pieceId: parseInt(e.target.querySelector("[name=piece-id]").value),
      utilisateur: e.target.querySelector("[name=utilisateur]").value,
      commentaire: e.target.querySelector("[name=commentaire]").value,
      nbEtoiles: e.target.querySelector("[name=notes]"),
    };

    // conversion de l'objet 'avis' en une chaine de caractère au format JSON (pour pouvoir etre utilisé dans 'body' de FETCH)
    const chargeUtile = JSON.stringify(avis);

    // Appel de la fonction fetch avec toutes les informations nécessaires
    //*POST l'objet AVIS en format JSON dans le lien du FETCH
    fetch("http://localhost:8081/avis", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: chargeUtile,
    });
  });
}

// -------------------------------------------------
// -------------------------------------------------
// -------------------------------------------------

//! Graphique avis avec script de la LIBRAIRIE chart.js:
export async function afficherGraphiqueAvis() {
  // Calcul du nombre total de commentaires par quantité d'étoiles attribuées
  const avis = await fetch("http://localhost:8081/avis").then((avis) =>
    avis.json()
  );
  const nb_commentaires = [0, 0, 0, 0, 0];
  for (let commentaire of avis) {
    nb_commentaires[commentaire.nbEtoiles - 1]++;
  }

  // Légende qui s'affichera sur la gauche à côté de la barre horizontale
  const labels = ["5", "4", "3", "2", "1"];

  // Données et personnalisation du graphique
  const data = {
    labels: labels,
    datasets: [
      {
        label: "Étoiles attribuées",
        data: nb_commentaires.reverse(),
        backgroundColor: "rgba(255, 230, 0, 1)", // couleur jaune
      },
    ],
  };
  //? label : le nom de la série de données. Elle s'affiche en haut du graphique avec la couleur correspondante utilisée pour les barres ;
  //? data : les données à mettre en forme ;
  //? backgroundColor : une chaîne de caractères spécifiant le code couleur pour la série de données.

  // Objet de configuration final
  const config = {
    type: "bar",
    data: data,
    options: {
      indexAxis: "y",
    },
  };

  // Rendu du graphique dans l'élément canvas
  const graphiqueAvis = document.querySelector("#graphique-avis");
  new Chart(graphiqueAvis, config);
  //todo OR
  // const graphiqueAvis = new Chart(
  //   document.querySelector("#graphique-avis"),
  //   config
  // );

  //! Graphique commentaire/dispo avec script de la LIBRAIRIE chart.js:

  //Récuperation des pieces depuis le LocalStorage
  const piecesJSON = window.localStorage.getItem("pieces");
  const pieces = JSON.parse(piecesJSON);

  //Calcul du nombre de commentaires
  let nbCommentairesDispo = 0;
  let nbCommentairesNonDispo = 0;

  for (let i = 0; i < avis.length; i++) {
    const piece = pieces.find((p) => p.id === avis[i].pieceId);

    if (piece) {
      if (piece.disponibilite) {
        nbCommentairesDispo++;
      } else {
        nbCommentairesNonDispo++;
      }
    }
  }

  console.log(nbCommentairesDispo);
  console.log(nbCommentairesNonDispo);

  const dataCom = [nbCommentairesDispo, nbCommentairesNonDispo];

  // Légende qui s'affichera sur la gauche à côté de la barre horizontale
  const labelsDispo = ["Disponibles", "Non dispo."];

  const dataDispo = {
    label: labelsDispo,
    datasets: [
      {
        label: "Nombre de commentaire",
        data: dataCom,
        backgroundColor: "rgba(0, 230, 255, 1)", // couleur turquoise
      },
    ],
  };

  // Objet de configuration final
  const configDispo = {
    type: "bar",
    data: dataDispo,
    options: {
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  };

  //rendu du graphique
  // const graphiqueDispoNbCom = document.querySelector("#graphique-dispo");
  // new Chart(graphiqueDispoNbCom, configDispo);
  new Chart(document.querySelector("#graphique-dispo"), configDispo);
}

//*! ajouter la propriété "type=module" dans l'élément script du HTML pour que l'import fonctionne
//import des variables ou des fonctiion d'un autre fichier .js
import {
  ajoutListenersAvis,
  ajoutListenersEnvoyerAvis,
  afficherAvis,
  afficherGraphiqueAvis,
} from "./avis.js";

//Récupération des pièces eventuellement stockées dans le localStorage
let pieces = window.localStorage.getItem("pieces");

if (pieces === null) {
  // pour importer les données du .json:
  //* with promise:
  //? const pieces = await fetch("http://localhost:8081/pieces").then(pieces => pieces.json());
  //* with await
  const response = await fetch("http://localhost:8081/pieces/");
  pieces = await response.json();

  // Transformation des pièces en STRING JSON
  const valeurPieces = JSON.stringify(pieces);
  // Stockage des informations dans le localStorage
  window.localStorage.setItem("pieces", valeurPieces);
} else {
  // Transformation du STRING 'pieces' en JAVASCRIPT OBJECT
  pieces = JSON.parse(pieces);
}

ajoutListenersEnvoyerAvis();

function genererPieces(pieces) {
  //for loop: pour lister tous les artciles
  for (let i = 0; i < pieces.length; i++) {
    const article = pieces[i];

    const sectionFiches = document.querySelector(".fiches");
    const pieceElement = document.createElement("article");

    const imageElement = document.createElement("img");
    const nomElement = document.createElement("h2");
    const prixElement = document.createElement("p");
    const categorieElement = document.createElement("p");
    const descriptionElement = document.createElement("p");
    const stockAvailable = document.createElement("p");
    const avisBouton = document.createElement("button");
    avisBouton.dataset.id = article.id;
    avisBouton.textContent = "Afficher les avis";

    imageElement.src = article.image;
    nomElement.innerText = article.nom;
    prixElement.innerText = `Prix:${article.prix}€ (${
      article.prix < 35 ? "€" : "€€€"
    })`;
    categorieElement.innerText = article.categorie ?? "(aucune catégorie)";
    descriptionElement.innerText =
      article.description ?? "Pas de description pour le moment.";
    stockAvailable.innerText = article.disponibilite
      ? "En stock"
      : "Rupture de stock";

    sectionFiches.appendChild(pieceElement);
    pieceElement.appendChild(imageElement);
    pieceElement.appendChild(nomElement);
    pieceElement.appendChild(prixElement);
    pieceElement.appendChild(categorieElement);
    pieceElement.appendChild(descriptionElement);
    pieceElement.appendChild(stockAvailable);
    pieceElement.appendChild(avisBouton);
  }

  ajoutListenersAvis();
}

genererPieces(pieces);

for (let i = 0; i < pieces.length; i++) {
  const id = pieces[i].id;
  const avisJSON = window.localStorage.getItem(`avis-pieces-${id}`);
  const avis = JSON.parse(avisJSON);

  if (avis !== null) {
    const pieceElement = document.querySelector(`article[data-id="${id}"]`);
    afficherAvis(pieceElement, avis);
  }
}

// ! Gestion boutons
const boutonTrier = document.querySelector(".btn-trier");
boutonTrier.addEventListener("click", function () {
  const piecesOrdonnees = Array.from(pieces); //créer une copie de l'array d'origine
  piecesOrdonnees.sort(function (a, b) {
    return a.prix - b.prix;
  });
  document.querySelector(".fiches").innerHTML = "";
  genererPieces(piecesOrdonnees);
  console.log(piecesOrdonnees);
});
//* arr.sort(fonctionComparaison):
// (fonctionComparaison) = Ce paramètre optionnel permet de spécifier une fonction définissant l'ordre de tri
// on compare a & b (a.prix - b.prix) pour savoir quel element passe avant l'autre etc.. juska ce que l'ordre ce fait

const boutonFiltrer = document.querySelector(".btn-filtrer");
boutonFiltrer.addEventListener("click", function () {
  const piecesFiltrees = pieces.filter(function (piece) {
    return piece.prix <= 35;
  });
  document.querySelector(".fiches").innerHTML = "";
  genererPieces(piecesFiltrees);
  console.log(piecesFiltrees);
});

const boutonDecroissant = document.querySelector(".btn-decroissant");
boutonDecroissant.addEventListener("click", () => {
  const piecesOrdonnees = Array.from(pieces);
  piecesOrdonnees.sort(function (a, b) {
    return b.prix - a.prix;
  });
  document.querySelector(".fiches").innerHTML = "";
  genererPieces(piecesOrdonnees);
  console.log(piecesOrdonnees);
});

const boutonNoDescription = document.querySelector(".btn-nodesc");
boutonNoDescription.addEventListener("click", () => {
  const piecesFiltrees = pieces.filter(function (piece) {
    return piece.description;
  });
  document.querySelector(".fiches").innerHTML = "";
  genererPieces(piecesFiltrees);
  console.log(piecesFiltrees);
});

//récupere juste les noms grace à 'map'
const noms = pieces.map((piece) => piece.nom);

for (let i = pieces.length - 1; i >= 0; i--) {
  if (pieces[i].prix > 35) {
    noms.splice(i, 1);
    //*splice = add or remove from [array]
    // at position [i], remove 1 item
  }
}

// !Pieces abordables (texte)
const pElement = document.createElement("p");
pElement.innerText = "Pièces abordables:";
//Création de la liste
const abordablesElements = document.createElement("ul");
//Ajout de chaque nom à la liste
for (let i = 0; i < noms.length; i++) {
  const nomElement = document.createElement("li");
  nomElement.innerText = noms[i];
  abordablesElements.appendChild(nomElement);
}
// Ajout de l'en-tête puis de la liste au bloc résultats filtres
document
  .querySelector(".abordables")
  .appendChild(pElement)
  .appendChild(abordablesElements);

// !Pieces disponibles (texte)
const nomDisponibles = pieces.map((piece) => piece.nom);
const prixDisponibles = pieces.map((piece) => piece.prix);

for (let i = pieces.length - 1; i >= 0; i--) {
  if (pieces[i].disponibilite === false) {
    nomDisponibles.splice(i, 1);
    prixDisponibles.splice(i, 1);
  }
}

const disponiblesElement = document.createElement("ul");
for (let i = 0; i < nomDisponibles.length; i++) {
  const nomElement = document.createElement("li");
  nomElement.innerText = `${nomDisponibles[i]} - ${prixDisponibles[i]}`;
  disponiblesElement.appendChild(nomElement);
}

const pElementDisponible = document.createElement("p");
pElementDisponible.innerText = "Pièces disponibles:";
document
  .querySelector(".disponibles")
  .appendChild(pElementDisponible)
  .appendChild(disponiblesElement);

const inputPriceRange = document.getElementById("inputRange");
const rangePriceTxt = document.querySelector(".priceRange");
const btnSortPrice = document.querySelector(".btn-trier-prix");

inputPriceRange.addEventListener("input", (e) => {
  rangePriceTxt.innerText = `<= ${e.target.value}€`;
});

btnSortPrice.addEventListener("click", () => {
  const prixFiltre = pieces.filter(
    (piece) => piece.prix <= inputPriceRange.value
  );
  document.querySelector(".fiches").innerHTML = "";
  genererPieces(prixFiltre);
});

// Ajout du listener pour mettre à jour des données du localStorage
const btnMettreAJour = document.querySelector(".btn-maj");
btnMettreAJour.addEventListener("click", () => {
  window.localStorage.removeItem("pieces");
});

//affichage graphique des Avis
await afficherGraphiqueAvis();

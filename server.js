const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const { body, validationResult } = require('express-validator');
const path = require('path');
const port = 1234;

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '/public')));

let utilisateurs = [];
let currentQuestion = 0;

// DB Cours
const cours = [
    {
        numero: 1,
        titre: 'Introduction à Node.js',
        descriptif: 'Apprendre les bases de Node.js',
        enseignants: ['Professeur A', 'Professeur B']
    },
    {
        numero: 2,
        titre: 'Programmation Web',
        descriptif: 'Développer des applications web',
        enseignants: ['Professeur C', 'Professeur D']
    }
];

// Question QCM
const questions = [
    { question: 'Quelle est la capitale de la France ?', reponses: ['Paris', 'Lyon', 'Marseille'], bonneReponse: 'Paris' },
    { question: 'Quelle est la capitale de l\'Espagne ?', reponses: ['Madrid', 'Barcelone', 'Valence'], bonneReponse: 'Madrid' },
    { question: 'Quelle est la capitale de l\'Italie ?', reponses: ['Rome', 'Milan', 'Naples'], bonneReponse: 'Rome' },
    { question: 'Quelle est la capitale de l\'Allemagne ?', reponses: ['Berlin', 'Munich', 'Francfort'], bonneReponse: 'Berlin' },
    { question: 'Quelle est la capitale du Royaume-Uni ?', reponses: ['Londres', 'Manchester', 'Liverpool'], bonneReponse: 'Londres' }
];

// I/ Express.js
// ----------------------------------------------------------------
//middleware
app.use((req, res, next) => {
    console.log(`Requête reçue à ${Date.now()}`);
    next();
});

app.get('/about', (req, res) => {
    console.log('Envoie des infos');
    res.send('Auteur : ...');
});

app.use((req, res, next) => {
    console.log(`Route demandée : ${req.url}`);
    next();
});

app.get('/', (req, res) => {
    res.send('Page d\'accueil');
});

app.get('/private', (req, res) => {
    res.send('Accès privé');
});

app.get('/private/mine', (req, res) => {
    res.send('Mon espace privé');
});

app.get('/pictures', (req, res) => {
    const file = path.join(__dirname, 'public/image.jpg');
    res.download(file);
});

// app.get('/cours/:numeroducours/descr', (req, res) => {
//     const numeroDuCours = req.params.numeroducours;
//     res.send(`Vous avez demandé le cours numéro ${numeroDuCours}`);
// });

app.get('/cours/:numeroducours/descr', (req, res) => {
    const numeroDuCours = req.params.numeroducours;
    const coursDetails = cours.find(c => c.numero == numeroDuCours);

    if (coursDetails) {
        res.render('cours', {
            titre: coursDetails.titre,
            descriptif: coursDetails.descriptif,
            enseignants: coursDetails.enseignants
        });
    } else {
        res.status(404).send('Cours non trouvé');
    }
});

// II) Traiter un formulaire avec express
// ----------------------------------------------------------------
// middleware
app.post('/', (req, res) => {
    const { nom, prenom, login, mdp, mdpConfirm } = req.body;

    if (mdp !== mdpConfirm) {
        res.send('Les mots de passe ne correspondent pas, veuillez réessayer.');
        return;
    }

    let utilisateur = utilisateurs.find(u => u.nom === nom && u.prenom === prenom);
    if (utilisateur) {
        res.send(`Bonjour ${prenom} ${nom}, votre compte a été mis à jour.`);
    } else {
        utilisateurs.push({ nom, prenom, login, mdp });
        res.send(`Bonjour ${prenom} ${nom}, ton compte est bien créé.`);
    }
});

// QCM Interactive
// --------------------------------
app.get('/qcm', (req, res) => {
    const q = questions[currentQuestion];
    res.send(`
        <form action="/check" method="POST">
            <p>${q.question}</p>
            ${q.reponses.map((rep, index) => `<label><input type="radio" name="reponse" value="${rep}">${rep}</label><br>`).join('')}
            <button type="submit">Corriger</button>
        </form>
    `);
});

app.post('/check', (req, res) => {
    const reponse = req.body.reponse;
    if (reponse === questions[currentQuestion].bonneReponse) {
        currentQuestion++;
        if (currentQuestion < questions.length) {
            res.redirect('/qcm');
        } else {
            res.send('Félicitations, vous avez terminé le QCM !');
        }
    } else {
        res.send('Mauvaise réponse, veuillez réessayer.');
    }
});

app.use((req, res) => {
    console.log('Abort');
    res.status(404).send('Erreur 404 : Page non trouvée');
});

app.listen(port, () => {
    console.log(`Serveur à l'écoute sur le port ${port}`);
});

<p>Readme</p><p></p>





Interest-Calculator













**Sulayman Hosna** 
10/08/2023
# **Sommaire**
[Déploiement d’une instance	3](#_toc143255792)

[Suppression d’une instance	8](#_toc143255793)

[Redirection de noms de domaine	9](#_toc143255794)

[Guide d’utilisation du logiciel	10](#_toc143255795)

[1.	Faire un calcul des intérêts de retard	10](#_toc143255796)

[2.	Consulter, ajouter ou modifier un taux d’intérêt	13](#_toc143255797)

[3.	Gestion des Utilisateurs (admin)	14](#_toc143255798)




# <a name="_toc143255792"></a>**DÉPLOIEMENT D’UNE INSTANCE**
1. Créer le nouveau projet sur la console Firebase : <https://console.firebase.google.com/?hl=fr>
   1. Saisir le nom du projet sous la forme « InterestCalculator-[NOM DU CLIENT] » 
   1. Noter l’identifiant du projet situé juste en-dessous du champ entré
   1. Désactiver Google Analytics

1. Sélection « Changer de formule » en bas à gauche, puis passer le projet à la formule payante 
   « Blaze ».
   1. Si la personne chargée du déploiement n’est pas la même que la personne possédant le compte de facturation : 
      1. Cliquer sur la roue crantée en haut à gauche, puis sélectionner « Utilisateurs et autorisations » 
      1. Cliquer sur « Ajouter un membre » 
      1. Inscrire l’adresse mail du compte Google de la personne possédant le compte de facturation
      1. Sélectionner le rôle propriétaire
      1. Valider en appuyant sur « OK ».
      1. La personne possédant le compte doit se rendre sur le projet à <https://console.firebase.google.com/?hl=fr> avec son compte et effectuer la manipulation décrite en étape 2.

1. Initialiser la base de données
   1. Accéder au menu « Firestore Database » situé dans la section « Créer » du volet latéral gauche 
   1. Cliquer sur « Créer une base de données » 
   1. Cocher « Démarrer en mode test », puis cliquer sur suivant
   1. Sélectionner la zone « australia-southeast1 », puis cliquer sur activer. (L’opération de création peut durer 1 minute.

1. Initialiser l’authentification
   1. Accéder au menu « Authentication » situé dans la section « Créer » du volet latéral
   1. Cliquer sur « Commencer » 
   1. Sélectionner « Adresse e-mail/Mot de passe
   1. Cocher « Adresse e-mail/Mot de passe », puis cliquer sur Enregistrer

1. Ajouter l’application
   1. Cliquer sur la roue crantée située en haut à gauche (à droite de Vue d’ensemble du projet). Puis cliquer sur « Paramètres du projet » 
   1. Dans la section « Vos applications » située en bas de la page, sélectionner l’icône « </> » 
   1. Ecrire « Capteur » dans le champ « Pseudo de l’application ». La case « Configurez également Firebase Hosting pour cette application. » n’a pas besoin d’être cochée
   1. Cliquer sur « Enregistrer l’application » 
   1. Copier les valeurs de l’objet « firebaseConfig », puis quitter la page :
      ![](Aspose.Words.00949414-5289-41aa-9a10-be9ffae7634a.002.png)

1. Configurer les répertoires de Secret
   1. Se rendre sur Google Cloud Platform <https://console.cloud.google.com/?hl=fr>
   1. En haut à gauche, cliquer sur le sélecteur de projet
   1. Sélectionner le projet crée. S’il n’est pas présent, naviguer dans l’onglet « TOUS ».
   1. ![A screenshot of a computer

Description automatically generated](Aspose.Words.00949414-5289-41aa-9a10-be9ffae7634a.003.png)A l’aide de la barre de recherche en haut, naviguer dans le menu « IAM et administration »
   1. Dans la liste affichée, modifier le compte avec pour nom « App Engine default service account »
   1. Cliquer sur « AJOUTER UN AUTRE RÔLE », puis ajouter le rôle « Administrateur Secret Manager » 
   1. Enregistrer. Le nouveau rôle doit apparaître dans la colonne rôle
   1. A l’aide de la barre de recherche en haut, naviguer dans le menu « Secret Manager »
   1. Cliquer sur « Activer » 
   1. Cliquer sur « Créer un code secret » 
   1. Dans le formulaire, remplir uniquement le champ « nom » avec « adSecret ». Puis cliquer sur « CREER UN SECRET » 
   1. Cliquer sur « Secret Manager » dans le volet latéral gauche
   1. Cliquer sur « Créer un code secret » 
   1. Dans le formulaire, remplir uniquement le champ « nom » avec « mailPassword ». Puis cliquer sur « CREER UN SECRET » 
   1. Vérifier que les noms aient été correctement entré, puis fermer la page.

1. Cloner le projet
   1. Ouvrir un terminal dans le dossier où l’on souhaite cloner le projet, puis exécuter la commande suivante
   1. Git clone 
   1. Ouvrir le dossier cloné dans Visual Studio Code (ou un autre éditeur de code)

1. Ouvrir les fichiers environment.ts et environment.prod.ts
   1. Dans ces 2 fichiers, remplacer le contenu de l’objet « firebase » par les valeurs « firebaseConfig » notées précédemment. Ceci permet de faire le lien avec la console Firebase. 

![](Aspose.Words.00949414-5289-41aa-9a10-be9ffae7634a.004.png)


1. Dans le terminal, exécuter les commandes suivantes depuis le dossier racine « capteur » : 
   1. npm install firebase && npm install -g firebase-tools && npm install -g @angular/cli && npm install && cd functions && npm install (prend plusieurs minutes)
   1. firebase login
   1. Se connecter au compte Google utilisé pour créer le projet
   1. firebase use [ID DU PROJET]
   1. ng serve

1. Une fois l’application exécutée en local $ ng serve
   1. Accéder à <http://localhost:4200/> 

1. Un pop-up intitulé « Création du compte administrateur » s’ouvre, remplir l’UID utilisateur noté précédemment et valider le formulaire. Les données de base se créent. On peut vérifier dans le menu « Firestore Database » de Firebase que la base de données ressemble à cela :

![](Aspose.Words.00949414-5289-41aa-9a10-be9ffae7634a.005.png)

**Important : Les « Rates » sont vides, ils seraient importants de rajoutés une fonction pour créer tous les taux d’intérêts désirer. De plus, il faut ajoutés les taux d’intérêts pour que le programme fonctionne correctement lorsque l’on créer une nouvelle instance.**

***Note :* Je ne l’ai pas fait car il y a énormément de taux, les rajoutés tous dans le code pollue beaucoup la compréhension de celui-ci. Il faudrait une autre solution.** 


1. Couper l’exécution de ng serve dans le terminal (ctrl + C)

1. Dans le terminal, exécuter les commandes suivantes :
   1. ng build && firebase deploy (la création des cloud functions durent plusieurs minutes)

1. Accéder à l’URL fourni en réponse ([ID DU PROJET].web.app

1. S’authentifier avec le compte administrateur précédemment crée (mail : <admin@admin.admin>)


1. Afin d’éviter toute confusion pour le prochain déploiement (déploiement sur le projet d’un autre client par exemple), exécuter la commande suivante :
   1. firebase use capteur-ebd93 && git stash



# <a name="_toc143255793"></a>**SUPPRESSION D’UNE INSTANCE**
1\. Se rendre sur le projet à l’adresse <https://console.firebase.google.com/?hl=fr> 

2\. Cliquer sur la roue crantée en haut à droite, puis sur « Paramètres du projet » 

3\. Tout en bas, cliquer sur « Supprimer le projet » 

4\. Cocher toutes les cases, et valider en cliquant sur « Supprimer le projet » 
# <a name="_toc143255794"></a>**REDIRECTION DE NOMS DE DOMAINE** 
1\. Se rendre sur le projet à l’adresse <https://console.firebase.google.com/?hl=fr> 

2\. Dans le volet latéral, dans la section « Créer », cliquer sur « Hosting » 

3\. Cliquer sur « Ajouter un domaine personnalisé » 

4\. Entrer le nom de domaine exact comme « [NOM DU PROJET].nc »

5\. Suivre la procédure d’enregistrement avec le gestionnaire de noms de domaine (CloudFlare etc.)

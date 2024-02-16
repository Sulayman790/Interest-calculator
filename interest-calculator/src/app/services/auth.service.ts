import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Auth, OAuthProvider, getAuth, sendPasswordResetEmail, signInWithEmailAndPassword, signInWithPopup, updatePassword} from '@angular/fire/auth';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  provider: OAuthProvider = new OAuthProvider('microsoft.com');
  auth: Auth = getAuth();

  constructor(private http: HttpClient, private router: Router) {
    // Paramètre de l'AD avec l'ID du tenant
  }

  
  // Authentification à un compte Capteur / Firebase
  async authFirebase(form: any) {
    let loginSuccessful = await signInWithEmailAndPassword(this.auth, form.contact, form.password)
      .then((userCredential) => {
        // Signed in 
        this.router.navigate(['/home']);
        localStorage.setItem('user', this.getCurrentUser());
        return true;
        // ...
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
      });
    if (loginSuccessful) {
      return true;
    }
    else {
      return false;
    }
  }

  // Authentification à un compte Active Directory
  authAD() {
    signInWithPopup(this.auth, this.provider)
      .then(async (result) => {
        // User is signed in.
        // IdP data available in result.additionalUserInfo.profile.

        // Get the OAuth access token and ID Token
        const credential = OAuthProvider.credentialFromResult(result);
        if (credential?.accessToken && credential.idToken) {
          localStorage.setItem('user', this.getCurrentUser());
          this.router.navigate(['/meetings']);
        }
      })
      .catch((error) => {
        // Handle error.
      });
  }

  // Récupère l'objet d'authentification pour pouvoir récupérer les ID Firebase / AD
  getAuth() {
    return this.auth;
  }

  // Récupère l'ID de l'utilisateur connecté selon son type de compte (AD / Firebase)
  getCurrentUser() {
    if (this.auth.currentUser?.providerData[0].providerId === "password") {
      return this.auth.currentUser?.uid;
    }
    else if (this.auth.currentUser?.providerData[0].providerId !== "password") {
      return this.auth.currentUser?.providerData[0].uid!;
    }
    else {
      return "";
    }
  }

  // Déconnexion de l'utilisateur
  signOut() {
    this.auth.signOut();
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }

  // Réinitialise le mot de passe de l'utilisateur
  resetUserPassword(email: string) {
    this.auth.languageCode = 'fr';
    sendPasswordResetEmail(this.auth, email)
      .then(() => {
        // Password reset email sent!
        // ..
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        // ..
      });
  }

  setUserPassword(newPassword: string) {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user !== null) {
      updatePassword(user, newPassword).then(() => {

        // Update successful.
      }).catch((error) => {
        console.log(error);

        // An error ocurred
        // ...
      });
    }
  }
}

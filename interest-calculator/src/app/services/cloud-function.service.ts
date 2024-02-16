import { Injectable } from '@angular/core';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { Subscriber } from '../classes/subscriber';



@Injectable({
  providedIn: 'root'
})
export class CloudFunctionService {

  functions: any;
  usFunctions: any;
  constructor() {
    this.functions = getFunctions(undefined, 'australia-southeast1');
  }

  // Ajoute un utilisateur Firebase
  addUser(subscriber: Subscriber) {
    const addUser = httpsCallable(this.functions, 'addUser');
    addUser({ subscriber: subscriber }).then((result) => {
    });
  }

  // Met à jour un utilisateur Firebase
  updateUser(subscriber: Subscriber) {
    const updateUser = httpsCallable(this.functions, 'updateUser');
    updateUser({ subscriber: subscriber }).then((result) => {
    });
  }

  // Reset le mot de passe d'un utilisateur Firebase
  resetUserPassword(subscriber: Subscriber) {
    const resetUserPassword = httpsCallable(this.functions, 'resetUserPassword');
    resetUserPassword({ subscriber: subscriber }).then((result) => {
    });
  }

  // Archive un utilisateur Firebase
  archiveUser(subscriber: Subscriber) {
    const archiveUser = httpsCallable(this.functions, 'archiveUser');
    archiveUser({ subscriber: subscriber }).then((result) => {
    });
  }
  
  async updateSecret(secretId: string, payload: string) {
    const updateSecret = httpsCallable(this.functions, 'updateSecret');
    updateSecret({ secretId: secretId, payload: payload }).then(result => {
      return result.data;
    });
  }
}

import { Timestamp } from "@angular/fire/firestore";

export class Subscriber {
    _id: string = "";
    lastName: string = "";
    firstName: string = "";
    lastConnection: Timestamp = Timestamp.now();
    displayLastConnection: string = "";
    fullName!: string; //Nom complet
    email: string = ""; //Adresse mail
    admin: boolean = false; //Si faux => rôle utilisateur
    password: string = ""; // Non-stocké en BD
    archived = false;
    constructor(values: any = {}) {
      Object.assign(this, values);
    }

}

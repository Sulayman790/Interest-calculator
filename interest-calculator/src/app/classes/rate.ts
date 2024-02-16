import { Timestamp } from "@angular/fire/firestore";

export class Rate {
    _id: string = "";
    type!: string; //Type de taux
    dateValue!: number; //Valeur du taux
    rateValue!: number; //Valeur du taux
    startDate!: Timestamp; //Date de début de validité
    displayedDate: string = ""; //Date de début de validité
    semester!: number; //Semestre de validité
    constructor(values: any = {}) {
      Object.assign(this, values);
    }

}

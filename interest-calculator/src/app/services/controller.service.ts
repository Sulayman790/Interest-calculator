import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { MatDialog } from '@angular/material/dialog';
import { Observable, firstValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';
import { CreateFirstAdminFormComponent } from '../forms/create-first-admin-form/create-first-admin-form.component';
import { RateService } from './rate.service';
import { SubscriberService } from './subscriber.service';
import { Subscriber } from '../classes/subscriber';
import { Rate } from '../classes/rate';
import { AuthService } from './auth.service';
import { v4 as uuidv4 } from 'uuid';
import { Timestamp } from '@angular/fire/firestore';
import { CloudFunctionService } from './cloud-function.service';


@Injectable({
  providedIn: 'root'
})
export class ControllerService {

  ratesObservable = new Observable<Rate[]>();
  subscriberObservable = new Observable<Subscriber[]>();
  allSubscriberObservable = new Observable<Subscriber[]>();

  constructor(private dialog: MatDialog, private db: AngularFirestore, private rateService: RateService,
  private subscriberService: SubscriberService, public authService: AuthService, public cloudFunctionService: CloudFunctionService) {
    this.ratesObservable = this.rateService.getAllRate();
    this.subscriberObservable = this.subscriberService.getSubscribers();
    this.allSubscriberObservable = this.subscriberService.getAllSubscribers();

  }

  // Renvoie l'objet dans un tableau donné selon son ID
  getObject(objectId: string, objectArray: any[]) {
    let objectTmp = undefined;
    for (let object of objectArray) {
      if (object._id === objectId) {
        objectTmp = object;
      }
    }
    return objectTmp;
  }

  async configApp() {    
    let isConfigurated = await firstValueFrom(this.db.collection('Config').doc('config').valueChanges());
    
    if (isConfigurated === undefined) {
      const dialogRef = this.dialog.open(CreateFirstAdminFormComponent, {
        autoFocus: false,
        disableClose: true
      })
      dialogRef.afterClosed().subscribe(result => {
        let newAdminID = result.newAdminID;
        this.subscriberService.createFirstAdmin(newAdminID);
        this.db.collection('Config').doc('config').set({
          projectId: environment.firebase.projectId
        })
      })
    }
  }

  getAllRatesObservable() {
    return this.ratesObservable;
  }

  getSubscribersObservable() {
    return this.subscriberObservable;
  }

  getAllSubscribersObservable() {
    return this.allSubscriberObservable;
  }

  addSubscriber(subscriber: Subscriber) {
    subscriber._id = uuidv4();
    this.subscriberService.addSubscriber(subscriber);
    this.cloudFunctionService.addUser(subscriber);
  }

  addRate(rate: Rate) {
    rate._id = uuidv4();
    this.rateService.addRate(rate);
  }

  deleteRate(rate: Rate) {
    this.rateService.deleteRate(rate);
  }

  updateRate(rate: Rate) {
    this.rateService.updateRate(rate);
  }

  // Met à jour un compte Capteur et un employé
  updateSubscriber(subscriber: Subscriber) {
    this.subscriberService.updateSubscriber(subscriber);
    this.cloudFunctionService.updateUser(subscriber)
  }

  updateSubscriberLastConnection(subscriberId: string, lastConnection: Timestamp) {
    this.subscriberService.updateSubscriberLastConnection(subscriberId, lastConnection);
  }

  // Réinitialise le mot de passe d'un employé
  resetUserPassword(subscriber: Subscriber) {
    this.cloudFunctionService.resetUserPassword(subscriber);
  }

  // Archive un employé
  archiveSubscriber(subscriber: Subscriber) {
    this.subscriberService.archiveSubscriber(subscriber);
  }


  // Vérifie si l'adresse mail existe déjà
  doesThisEmailExist(email: string, subscribers: Subscriber[]): boolean {
    let found = false;
    for (let subscriber of subscribers) {
      if (subscriber.email === email) {
        found = true;
      }
    }
    return found;
  }

  // Supprime tous les objets archivés
  deleteArchivedObjects() {

  }  
}

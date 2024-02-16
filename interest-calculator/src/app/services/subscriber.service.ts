import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable, firstValueFrom, timestamp } from 'rxjs';
import { Subscriber } from '../classes/subscriber';
import { Timestamp } from "@angular/fire/firestore";

@Injectable({
  providedIn: 'root'
})
export class SubscriberService {

  constructor(private db: AngularFirestore) {
  }

  getSubscriber(subscriberId: string): Observable<any> {
    return this.db.collection('Subscriber').doc(subscriberId).valueChanges();
  }

  getSubscribers(): Observable<any> {
    return this.db.collection('Subscriber', ref => ref.where('archived', '==', false)).valueChanges();
  }

  getAllSubscribers(): Observable<any> {
    return this.db.collection('Subscriber').valueChanges();
  }

  addSubscriber(subscriber: Subscriber) {
    this.db.collection('Subscriber').doc(subscriber._id).set({
      _id: subscriber._id,
      lastName: subscriber.lastName,
      firstName: subscriber.firstName,
      fullName: subscriber.fullName,
      email: subscriber.email,
      admin: subscriber.admin,
      lastConnection: Timestamp.now(),
      archived: false
    });
  }

  // Crée le premier compte admin au déploiement
  createFirstAdmin(newAdminID: string) {
    this.db.collection('Employee').doc(newAdminID).set({
      _id: newAdminID,
      lastName: "Admin",
      firstName: "Admin",
      fullName: "Admiadminn Admin",
      email: "admin@admin.",
      lastConnection: Timestamp.now(),
      admin: true,
      archived: false
    });
  }

  async updateSubscriber(subscriber: Subscriber) {
    this.db.collection('Subscriber').doc(subscriber._id).update(Object.assign({}, subscriber));
  }

  async updateSubscriberLastConnection(subscriberId: string, lastConnection: Timestamp) {
    this.db.collection('Subscriber').doc(subscriberId).update({
      lastConnection: lastConnection
    });
  }


  archiveSubscriber(subscriber: Subscriber) {
    this.db.collection('Subscriber').doc(subscriber._id).update({
      archived: true
    });
  }


  async deleteArchivedSubscribers() {
    let subscribersFound = await firstValueFrom(this.getSubscribers());
    for (let subscriber of subscribersFound) {
      this.db.collection('Subscriber').doc(subscriber._id).delete();
    }
  }  
}

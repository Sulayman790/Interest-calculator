import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { Rate } from '../classes/rate';

@Injectable({
  providedIn: 'root'
})
export class RateService {

  constructor(private db: AngularFirestore) {
  }

  getRate(rateId: string): Observable<any> {
    return this.db.collection('Rate').doc(rateId).valueChanges();
  }

  getAllRate(): Observable<any> {
    return this.db.collection('Rate').valueChanges();
  }

  addRate(rate: Rate) {
    this.db.collection('Rate').doc(rate._id).set({
      _id: rate._id,
      type: rate.type,
      dateValue: rate.dateValue,
      semester: rate.semester,
      startDate: rate.startDate,
      rateValue: rate.rateValue,
    });
  }

  async updateRate(rate: Rate) {
    this.db.collection('Employee').doc(rate._id).update(Object.assign({}, rate));
  }

  deleteRate(rate: Rate) {
    this.db.collection('Rate').doc(rate._id).delete();
  }

}

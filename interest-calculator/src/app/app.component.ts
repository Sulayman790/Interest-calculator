import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ControllerService } from './services/controller.service';
import { MatDialog } from '@angular/material/dialog';
import { Observable, Subscription, combineLatestWith } from 'rxjs';
import { Subscriber } from './classes/subscriber';
import packageJson from '../../package.json';
import { Rate } from './classes/rate';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: []
})
export class AppComponent {
  title = 'interest-calculator';
  public version: string = packageJson.version;
  userID!: string;
  currentSubscriber!: Subscriber;

  all$ = new Subscription();
  allSubscribers$ = new Observable<Subscriber[]>();
  allRates$ = new Observable<Rate[]>();

  subscribers: Subscriber[] = [];
  rates: Rate[] = [];

  constructor(private controllerService: ControllerService, private router: Router,
    private dialog: MatDialog) {
  }

  ngOnInit() {
    this.controllerService.configApp();
    this.allSubscribers$ = this.controllerService.getAllSubscribersObservable();
    this.allRates$ = this.controllerService.getAllRatesObservable();

    this.controllerService.authService.getAuth().onAuthStateChanged(user => {
      if (user) {
        this.userID = this.controllerService.authService.getCurrentUser();
        this.all$ = this.allSubscribers$.pipe(combineLatestWith(this.allRates$)).subscribe(([subscriberFound, rateFound]) => {
          this.userID = this.controllerService.authService.getCurrentUser();
          this.subscribers = subscriberFound;
          this.rates = rateFound;

          if (this.userID !== undefined) {
            let found = false;
            for (let subscriber of this.subscribers) {
              if (this.userID === subscriber._id && !subscriber.archived) {
                found = true;
                this.currentSubscriber = subscriber;
              }
            }
            if (!found) {
              this.signOut();
            }
          }
        })

      }
      else {
        this.all$.unsubscribe();
        this.userID = "";
      }
    });
  }  
  
  getUserID() {
    this.userID = this.controllerService.authService.getCurrentUser();
  }

  signedIn() {
    return !(this.router.url === "/" || this.router.url === "/login");
  }

  signOut() {
    this.controllerService.authService.signOut()
  }
  
  isUserAdmin() {
    for (let subscriber of this.subscribers) {
      if (subscriber._id === this.userID) {
        return subscriber.admin;
      }
    }
    return false;
  }

  isSelected(buttonName: string) {
    let selected = false;
    let url = this.router.url;
    switch (buttonName) {
      case "home":
        if (url.startsWith('/home')) {
          selected = true;
        }
        break;

      case "admin":
        if (url.startsWith('/admin')) {
          selected = true;
        }
        break;

      case "rate":
        if (url.startsWith('/rate')) {
          selected = true;
        }
        break;        
    }

    if (selected) {
      return {
        'background-color': '#1565c0'
      }
    }
    else {
      return {};
    }
  }

}

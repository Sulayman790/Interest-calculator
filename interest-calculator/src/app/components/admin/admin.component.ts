import { trigger, state, style, transition, animate } from '@angular/animations';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Observable, Subscription, combineLatestWith } from 'rxjs';
import { Rate } from 'src/app/classes/rate';
import { Subscriber } from 'src/app/classes/subscriber';
import { LegalRateFormComponent } from 'src/app/forms/legal-rate-form/legal-rate-form/legal-rate-form.component';
import { ControllerService } from 'src/app/services/controller.service';
import { SubscriberFormComponent } from 'src/app/forms/subscriber-form/subscriber-form.component';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss'],
  animations: [
    trigger('openCloseAccordion', [
      state('open', style({
        height: '*'
      })),
      state('closed', style({
        height: '0',
        overflow: 'hidden',
        margin: '0'
      })),
      transition('open => closed', [
        animate('0.25s')
      ]),
      transition('closed => open', [
        animate('0.25s')
      ]),
    ])
  ]
})
export class AdminComponent implements OnInit, OnDestroy {

  subscribers: Subscriber[] = [];
  rates: Rate[] = [];
  
  title = "Page admin";
  currentUserId!: string;
  isAdmin!: boolean;

  // Colonnes du tableau
  displayedColumnsSubscriber!: string[];
  displayedColumnsRate!: string[];
  // Données du tableau
  dataSourceSubscriber!: MatTableDataSource<Subscriber>;
  dataSourceRate!: MatTableDataSource<Rate>;
  // Bouton de tri colonne
  @ViewChild(MatSort) sort!: MatSort;
  // Filtre de recherche
  filter = "";

  rateTypes = [
    { value: 'legal_pro', viewValue: "taux d'intérêt légal (créancier pro)" },
    { value: 'legal_particulier', viewValue: "taux d'intérêt légal (créancier particulier)" },
    { value: 'refi', viewValue: "taux d'intérêt refinancement bce" },
    { value: 'tmm', viewValue: "taux d'intérêt moyen du marché monétaire" },
  ];

  selectedRateType: string = 'legal_pro';

  all$ = new Subscription();
  subscribers$ = new Observable<Subscriber[]>();
  rates$ = new Observable<Rate[]>();

  componentVisible = false;
  rateHeader = "Taux d'intérêts";
  subscriberHeader = "Informations sur les abonnés";

  rateExpanded = false;
  subscribersExpanded = false;

  rateButtonExpanded = false;
  subscribersButtonExpanded = false;
  
  constructor( private dialog: MatDialog, private controllerService: ControllerService) { }

  ngOnInit(): void {
    this.rates$ = this.controllerService.getAllRatesObservable();
    this.subscribers$ = this.controllerService.getSubscribersObservable();

    this.subscribeToAll();
  }

  ngOnDestroy(): void {
    this.all$.unsubscribe();
  }

  subscribeToAll(){
    this.all$ = this.subscribers$.pipe(combineLatestWith(this.rates$)).subscribe(([suscribersFound, ratesFound]) => {
      this.componentVisible = true;
      // On récupère les données puis on trie les abonnés
      this.subscribers = suscribersFound;
      this.rates = ratesFound;

      let displayRates : Rate[] = [];
      let displaySubscribers = this.subscribers;

      for (let rate of this.rates) {
        if (rate.type === this.selectedRateType) {
          displayRates.push(rate);
        }
      }

      for (let rate of displayRates) {
        rate.rateValue = this.roundNumber(rate.rateValue, 4);
      }

      displayRates.sort((a, b) => a.startDate.seconds - b.startDate.seconds || a.startDate.nanoseconds - b.startDate.nanoseconds);

      displaySubscribers.sort((a, b) => a.lastName.localeCompare(b.lastName));
      for (let subscriber of displaySubscribers) {
        subscriber.displayLastConnection = subscriber.lastConnection.toDate().toLocaleDateString('fr-FR') + ' ' + subscriber.lastConnection.toDate().toTimeString().substring(0, 8);
      }
      this.setColumns();

      // On définit les données et le tri des tableaux
      this.dataSourceRate = new MatTableDataSource(displayRates)
      this.dataSourceRate.sort = this.sort;
      this.dataSourceSubscriber = new MatTableDataSource(displaySubscribers)
      this.dataSourceSubscriber.sort = this.sort;

      // On définit la méthode de recherche du tableau
      this.dataSourceSubscriber.filterPredicate = function (data, filter: string): boolean {
        return data.email.toLowerCase().includes(filter) || data.lastName.toLowerCase().includes(filter) || data.firstName.toLowerCase().includes(filter) || data.fullName.toLowerCase().includes(filter);
      };
      // On modifie la méthode tri du tableau, car par défaut il sépare minuscules et majuscules
      this.dataSourceSubscriber.sortingDataAccessor = (data: any, sortHeaderId: string): string => {
        if (typeof data[sortHeaderId] === 'string') {
          return data[sortHeaderId].toLocaleLowerCase();
        }

        return data[sortHeaderId];
      };
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceSubscriber.filter = filterValue.trim().toLowerCase();
  }


  modifyRate(rateType: string) {
    let displayRates: Rate[] = [];

    for (let rate of this.rates) {
      if (rate.type === this.selectedRateType) {
        displayRates.push(rate);
      }
    }

    for (let rate of displayRates) {
      rate.rateValue = this.roundNumber(rate.rateValue, 4);
      rate.displayedDate = rate.startDate.toDate().toLocaleDateString('fr-FR');
    }

    this.setColumns();

    // On définit les données et le tri des tableaux
    this.dataSourceRate = new MatTableDataSource(displayRates)
    this.dataSourceRate.sort = this.sort;

  }

  roundNumber(rate: number, round: number) : number {
    const possibleRounds = [
      Math.ceil(rate),                   // Arrondi supérieur
      Math.floor(rate),                  // Arrondi inférieur
      Math.round(rate),                  // Arrondi sans décimale
      Number(rate.toFixed(1)),           // Arrondi avec 1 décimale
      Number(rate.toFixed(2)),           // Arrondi avec 2 décimales
      Number(rate.toFixed(3)),           // Arrondi avec 3 décimales
      Number(rate.toFixed(4)),           // Arrondi avec 4 décimales
    ];
    return possibleRounds[round];
  }

  isUserAdmin() {
    this.currentUserId = this.controllerService.authService.getCurrentUser();
    let isAdmin = false;
    for (let subscriber of this.subscribers) {
      if (subscriber._id === this.currentUserId && subscriber.archived === false) {
        isAdmin = subscriber.admin;
      }
    }
    return isAdmin;
  }

  convertToTimestamp(dateString: string) {
    var parts = dateString.split('/');
    var date = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
    return date;
  }

  expandRates() {
    let delay;
    if (this.subscribersExpanded ) {
      delay = 250;
    }
    else {
      delay = 0;
    }
    this.rateButtonExpanded = !this.rateButtonExpanded;

    this.subscribersButtonExpanded = false;
    this.subscribersExpanded = false;

    setTimeout(() => {
      this.rateExpanded = !this.rateExpanded;
    }, delay);
  }

  expandSubscribers() {
    let delay;
    if (this.rateExpanded ) {
      delay = 250;
    }
    else {
      delay = 0;
    }
    this.subscribersButtonExpanded = !this.subscribersButtonExpanded;

    this.rateExpanded = false;
    this.rateButtonExpanded = false;

    setTimeout(() => {
      this.subscribersExpanded = !this.subscribersExpanded;
    }, delay);
  }


  setColumns() {
    if(this.isUserAdmin()){
      this.isAdmin = true;
      this.displayedColumnsSubscriber = ['lastName', 'firstName', 'email', 'dernière connexion', 'actions'];
      this.displayedColumnsRate = ['rateType', 'date', 'rateValue', 'actions'];
    }
    else {
      this.isAdmin = false;
      this.displayedColumnsSubscriber = ['lastName', 'firstName', 'email', 'dernière connexion'];
      this.displayedColumnsRate = ['rateType', 'date', 'rateValue'];
    }
  }

  openAddRateDialog() {
    const dialogRef = this.dialog.open(LegalRateFormComponent, {
      autoFocus: false,
      width: '50vw',
      data: { 
        title: 'Ajouter un taux',
        adding: true
      },
      panelClass: "mat-dialog-height-transition"
    });
  }

  openEditRateDialog(rate: Rate): void {
    const dialogRef = this.dialog.open(LegalRateFormComponent, {
      autoFocus: false,
      width: '50vw',
      data: {
        rateId: rate._id,
        rate: rate,
        adding: false
      },
      panelClass: "mat-dialog-height-transition"
    });
  }

  deleteRateDialog(rate: Rate) {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce taux ?")) {
      this.controllerService.deleteRate(rate);
    }
  }

  openAddSubscriberDialog() {
    let subscribers = this.subscribers;
    const dialogRef = this.dialog.open(SubscriberFormComponent, {
      autoFocus: false,
      width: '50vw',
      data: { 
        title: 'Ajouter un taux',
        adding: true,
        subscribers: subscribers
      },
      panelClass: "mat-dialog-height-transition"
    });
  }

  openEditSubscriberDialog(subscriber: Subscriber): void {
    let subscribers = this.subscribers;
    const dialogRef = this.dialog.open(SubscriberFormComponent, {
      autoFocus: false,
      width: '50vw',
      data: {
        subscribers: subscribers,
        subscriberId: subscriber._id,
        adding: false
      }
    });
  }

  archiveSubscriber(subscriber: Subscriber) {
    if (confirm('Etes vous sûr(e) de vouloir archiver ' + subscriber.firstName + " " + subscriber.lastName + " ?")) {
      this.controllerService.archiveSubscriber(subscriber);
      this.dataSourceSubscriber.filter = "";
      this.filter = "";
    }  
  }  
    
}

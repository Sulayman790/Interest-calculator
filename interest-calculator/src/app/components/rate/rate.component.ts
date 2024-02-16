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
  selector: 'app-rate',
  templateUrl: './rate.component.html',
  styleUrls: ['./rate.component.scss'],
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

export class RateComponent  implements OnInit, OnDestroy {

  subscribers: Subscriber[] = [];
  rates: Rate[] = [];
  
  title = "Informations sur les taux d'intérêts";
  currentUserId!: string;
  isAdmin!: boolean;

  // Colonnes du tableau
  displayedColumnsRate!: string[];
  // Données du tableau
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

  rateSources = [
    { value: 'legal', viewValue: "https://www.banque-france.fr/statistiques/taux-et-cours/les-taux-dinteret-legal"},
    { value: 'refi', viewValue: "https://www.euribor-rates.eu/fr/taux-bce/" },
    { value: 'rmm', viewValue: "https://www.moneyvox.fr/bourse/eonia.php" },
  ];

  selectedRateType: string = 'legal_pro';

  all$ = new Subscription();
  subscribers$ = new Observable<Subscriber[]>();
  rates$ = new Observable<Rate[]>();

  componentVisible = false;
  rateHeader = "Intérêts";
  subscriberHeader = "Abonnés";

  rateExpanded = false;
  subscribersExpanded = false;

  rateButtonExpanded = false;
  subscribersButtonExpanded = false;
  
  constructor( private dialog: MatDialog, private controllerService: ControllerService) { }

  ngOnInit(): void {
    this.rates$ = this.controllerService.getAllRatesObservable();
    this.subscribers$ = this.controllerService.getAllSubscribersObservable();

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

      for (let rate of this.rates) {
        if (rate.type === this.selectedRateType) {
          displayRates.push(rate);
        }
      }

      for (let rate of displayRates) {
        rate.rateValue = this.roundNumber(rate.rateValue, 4);
      }

      displayRates.sort((a, b) => a.startDate.seconds - b.startDate.seconds || a.startDate.nanoseconds - b.startDate.nanoseconds);

      this.setColumns();

      this.dataSourceRate = new MatTableDataSource(displayRates)
      this.dataSourceRate.sort = this.sort;
    });
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


  setColumns() {
    if(this.isUserAdmin()){
      this.isAdmin = true;
      this.displayedColumnsRate = ['rateType', 'date', 'rateValue', 'actions'];
    }
    else {
      this.isAdmin = false;
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

  openEditRateDialog(rate: Rate) {
    const dialogRef = this.dialog.open(LegalRateFormComponent, {
      autoFocus: false,
      width: '50vw',
      data: {
        rateId: rate._id,
        rate: rate, 
        title: 'Modifier un taux',
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

  toFrenchDates(date: Date){
    return date.toLocaleString("fr-FR", {day: '2-digit',month: '2-digit', year: '2-digit', hour: '2-digit', minute:'2-digit'});
  }

  toFrenchDatesWithoutHours(date: Date){
    return date.toLocaleDateString("fr-FR", {day: '2-digit',month: '2-digit', year: '2-digit'});
  }
}

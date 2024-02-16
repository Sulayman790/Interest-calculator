import { Component, OnDestroy, OnInit } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { Subscriber } from 'src/app/classes/subscriber';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { v4 as uuidv4 } from 'uuid';
import { Observable, Subscription, combineLatestWith, retry, timestamp } from 'rxjs';
import { Rate } from 'src/app/classes/rate';
import { ControllerService } from 'src/app/services/controller.service';
import { Timestamp } from '@angular/fire/firestore';
import { MatTableDataSource } from '@angular/material/table';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
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
    ]),
    trigger('FadeIn', [
      state('show', style({
        opacity: '1'
      })),
      state('hide', style({
        opacity: '0'
      })),
      transition('hide => show', [
        animate('0.5s ease-in')
      ]),
      transition('show => hide', [
        animate('0.5s ease-out')
      ]),
    ])
  ]
})
export class HomeComponent implements OnInit, OnDestroy {

  title = "Calcul d'intérêts de retard";
  userID!: string;
  
  debtValue: number = 0;
  activeButton!: number;
  startDate: Date = new Date();
  endDate: Date = new Date();
  ratePercent: number = 0;
  fixeRate: number = 0;
  rateType!: string;
  multiplicationFactor: number = 1;
  roundValue: number = 4;
  increasedBy: number = 0;
  capital: number = 0;
  capitalisationDate: Date = new Date(2000, 11, 31);

  isInterestCapitalisation = false;
  isAdjustRate = false;

  isTableVisible = false;
  componentVisible = false;


  displayedColumns: string[] = ['period', 'NbJours', 'capital', 'taux', 'interet', 'interetCum'];
  dataSource = new MatTableDataSource<any>();

  roundsValues = new Map<number, string>([
    [0, "l'entier supérieur"],
    [1, "l'entier inférieur"],
    [2, "arrondit sans décimale"],
    [3, "1 décimale"],
    [4, "2 décimales"],
    [5, "3 décimales"],
    [6, "4 décimales"],
  ]);;

  all$ = new Subscription();
  rates$ = new  Observable<Rate[]>();
  subscribers$ = new  Observable<Subscriber[]>();
  rates!: Rate[];
  subscribers!: Subscriber[];
 
  calculType = ["Taux d'Intéret Légal (créancier particulier)", "Taux d'Intéret Légal (créancier pro)", "Taux de refinancement BCE",
   "Taux Fixe", "Jugement (créancier particulier)", "Jugement (créancier pro)", "Pénalités de retard 441-6"];


  constructor(private firestore: AngularFirestore, private controllerService: ControllerService) {
    this.startDate = new Date(this.startDate.getFullYear(), this.startDate.getMonth(), this.startDate.getDate(), 0, 0, 0);
    this.endDate = new Date(this.endDate.getFullYear(), this.endDate.getMonth(), this.endDate.getDate(), 0, 0, 0);
  }

  ngOnInit(): void {
    this.userID = this.controllerService.authService.getCurrentUser();
    this.activeButton = 0;
    this.rates$ = this.controllerService.getAllRatesObservable();
    this.subscribers$ = this.controllerService.getSubscribersObservable();

    this.all$ = this.rates$.pipe(combineLatestWith(this.subscribers$)).subscribe(([rateFound, subscriberFound]) => {
      this.rates = rateFound;
      this.subscribers = subscriberFound;
      this.componentVisible = true;
    })

  }

  ngOnChanges(): void {
    this.activeButton = 0;
    this.rates$ = this.controllerService.getAllRatesObservable();
    this.subscribers$ = this.controllerService.getSubscribersObservable();

    this.all$ = this.rates$.pipe(combineLatestWith(this.subscribers$)).subscribe(([rateFound, subscriberFound]) => {
      this.rates = rateFound;
      this.subscribers = subscriberFound;
    })

  }
  
  ngOnDestroy(): void {
    this.all$.unsubscribe();
  }

  // TODO this function need to be reduced in the future 
  calculate() {
      let interestRate: number = 0;
      let interestRateCumulated: number = 0;
      this.resetCalculateVariable();

      if(this.startDate && this.endDate && this.debtValue != null ){
        let numberOfDays = Math.round((this.endDate.getTime() - this.startDate.getTime()) / 1000/60/60/24) + 1;
        let jugementStart = new Date(this.startDate.getFullYear(), this.startDate.getMonth(), this.startDate.getDate() + 59);
        let periodStart = this.startDate;
        let startingCapital = this.debtValue;

        this.isInterestCapitalisationCalcul();

        for (let d = 0; d <= numberOfDays; d ++){
          let currentDate = new Date(this.startDate.getFullYear(), this.startDate.getMonth(), this.startDate.getDate() + d);

          // INTERETS LEGAUX & TAUX FIXE
          if(this.activeButton === 0 || this.activeButton === 1 || this.activeButton === 3 || this.activeButton === 6){

            if( (currentDate.getTime() === this.endDate.getTime()) || this.legalPartSearch(currentDate.getTime()) 
            || ((this.isInterestCapitalisation === true) && (currentDate.getDate() === this.capitalisationDate.getDate()) 
            && (currentDate.getMonth() === this.capitalisationDate.getMonth()))){
              
              let nbJours = Math.round((currentDate.getTime() - periodStart.getTime())/1000/60/60/24) + 1 ;
              interestRate = this.calculateInterestRate( currentDate, nbJours);
              interestRateCumulated += interestRate;
              this.addRow(periodStart, currentDate, nbJours, this.roundNumber(startingCapital + interestRateCumulated, this.roundValue),
              this.roundNumber((this.ratePercent * this.multiplicationFactor + this.increasedBy), this.roundValue), this.roundNumber(interestRate,
                this.roundValue), this.roundNumber(interestRateCumulated, this.roundValue));

              this.isCumulatedInterestRateCalcul(startingCapital, interestRateCumulated);
              periodStart =  new Date(this.startDate.getFullYear(), this.startDate.getMonth(), this.startDate.getDate() + d + 1);
            }
          }

          // // INTERETS BCE
          if(this.activeButton === 2 || this.activeButton ===  5){

            if( (currentDate.getTime() === this.endDate.getTime()) || this.refiSearch(currentDate.getTime()) 
            || ((this.isInterestCapitalisation === true) && (currentDate.getDate() === this.capitalisationDate.getDate()) 
            && (currentDate.getMonth() === this.capitalisationDate.getMonth()))) {
              this.isAdjustRate = false;
              let nbJours = Math.round((currentDate.getTime() - periodStart.getTime())/1000/60/60/24) + 1 ;
              interestRate = this.calculateInterestRate( currentDate, nbJours);
              interestRateCumulated += interestRate;
              
              this.addRow(periodStart, currentDate, nbJours, this.roundNumber(startingCapital + interestRateCumulated, this.roundValue),
                this.roundNumber((this.ratePercent * this.multiplicationFactor + this.increasedBy), this.roundValue), this.roundNumber(interestRate,
                this.roundValue), this.roundNumber(interestRateCumulated, this.roundValue));
              
              this.isCumulatedInterestRateCalcul(startingCapital, interestRateCumulated);

              periodStart =  new Date(this.startDate.getFullYear(), this.startDate.getMonth(), this.startDate.getDate() + d + 1);
            }
          }

          // // JUGEMENT
          if(this.activeButton === 4 || this.activeButton ===  5){
            this.resetVariable();
            if( (currentDate.getTime() === this.endDate.getTime()) ||
            ((currentDate.getTime() === jugementStart.getTime()) || (currentDate.getDate()=== 31 && currentDate.getMonth() === 11))){

              let nbJours = Math.round((currentDate.getTime() - periodStart.getTime())/1000/60/60/24) + 1 ;

              if (currentDate.getTime() <= jugementStart.getTime()){

                interestRate = this.calculateInterestRate( currentDate, nbJours);
                interestRateCumulated += interestRate;
                this.addRow(periodStart, currentDate, nbJours, this.roundNumber(startingCapital + interestRateCumulated, this.roundValue),
                this.roundNumber((this.ratePercent * this.multiplicationFactor + this.increasedBy), this.roundValue), this.roundNumber(interestRate,
                this.roundValue), this.roundNumber(interestRateCumulated, this.roundValue));
              }

              else {
                this.isAdjustRate  = true; 
                interestRate =  this.calculateInterestRate( currentDate, nbJours);
                interestRateCumulated += interestRate;
                this.addRow(periodStart, currentDate, nbJours, this.roundNumber(startingCapital + interestRateCumulated, this.roundValue),
                this.roundNumber((this.ratePercent * this.multiplicationFactor + this.increasedBy), this.roundValue), this.roundNumber(interestRate,
                this.roundValue), this.roundNumber(interestRateCumulated, this.roundValue));
              }
              periodStart =  new Date(this.startDate.getFullYear(), this.startDate.getMonth(), this.startDate.getDate() + d + 1);
            }
          }
          // This part was in the initial version but it was commented, so I commented it

          // //T4M - TMM
          // if( (currentDate.getTime() === this.endDate.getTime()) || this.tmmSearch(currentDate.getTime()) ||
          // ((this.isInterestCapitalisation === true) && (currentDate.getDate() === this.capitalisationDate.getDate()) &&
          // (currentDate.getMonth() === this.capitalisationDate.getMonth()))){

          //   let nbJours = Math.round((currentDate.getTime() - periodStart.getTime())/1000/60/60/24) + 1 ;
          //   interestRate = this.calculateInterestRate( currentDate, nbJours);
          //   interestRateCumulated += interestRate;
          //   // this.addRow(currentDate, interestRate, interestRateCumulated);
          //   if(this.isInterestCapitalisation == true) {
          //     this.capital = startingCapital + interestRateCumulated;
          //   }
          //   periodStart =  new Date(this.startDate.getFullYear(), this.startDate.getMonth(), this.startDate.getDate() + d + 1);
          // }
        }
        this.capital = startingCapital + interestRateCumulated;
      }
  }

  isInterestCapitalisationCalcul() {
    if(this.activeButton === 6 || this.activeButton === 5){
      this.isInterestCapitalisation = false;
    }
  }

  isCumulatedInterestRateCalcul(startingCapital: number, interestRateCumulated: number) {
    if(this.isInterestCapitalisation == true){
      this.capital = startingCapital + interestRateCumulated;
    }
  }

  resetCalculateVariable(){
    this.isTableVisible = true;
    this.isAdjustRate = false;
    this.capital= this.debtValue;
    this.ratePercent = 0;
    this.dataSource.data = [];
    this.controllerService.updateSubscriberLastConnection(this.userID, Timestamp.now());
  }

  resetVariable(){
    this.multiplicationFactor = 1;
    this.increasedBy = 0;
    this.ratePercent = 0;
    this.isAdjustRate = false;
  }

  formatNumber(value: number): string {
    return value.toLocaleString();
  }

  convertToTimestamp(dateString: string) {
    var parts = dateString.split('/');
    var date = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
    return date;
  }

  convertDateToStringFormat(date: Date): string {
    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();
    return day + '/' + month + '/' + year;
  }

  convertDateWithOffSet(date: Timestamp): Date {
    let dateToConvert = new Date(date.seconds * 1000);
    return new Date(dateToConvert.getTime() + (dateToConvert.getTimezoneOffset() * 60 * 1000));
  }

  convertDate(date: Timestamp): Date {
    let dateToConvert = new Date(date.seconds * 1000);
    return new Date(dateToConvert.getTime());
  }

  doesInterestCapitalisationApply(checked : number ): void {
    if(checked === 1){
      this.isInterestCapitalisation = true;
    }
    else{
      this.isInterestCapitalisation = false;
    }
  }

  setActiveButton(buttonIndex: number): void {
    if (this.activeButton  === buttonIndex) {
      return;
    }
    this.activeButton = buttonIndex;
  }

  onPercentChange() {
    const valInDecimals = this.ratePercent / 100;
  }
  

  findRateType(){
    if(this.activeButton === 0 || this.activeButton === 4 ) {
      this.rateType = "legal_particulier";
    }
    if(this.activeButton === 1 || this.activeButton === 5 ) {
      this.rateType = "legal_pro";
    }
    if(this.activeButton === 2 || this.activeButton === 6 ) {
      this.rateType = "refi";
    }
    if(this.activeButton === 3 ) {
      this.rateType = "";
    }
    if(this.activeButton === 8 ) {
      this.rateType = "tmm";
    }
    if(this.activeButton === 7) {
      this.rateType = "legal";
    }
  }

  filterRate(dateValue: number): number | undefined{
    this.findRateType();
    let filterRateType = this.rates.filter((rate: Rate) => rate.type === this.rateType);
    let rateDate = filterRateType.filter((rate: Rate) =>  this.convertDate(rate.startDate).getTime() >  this.startDate.getTime());
    let nearRate =  this.findRate(dateValue, rateDate);
    if(nearRate?.rateValue === 0 || nearRate === undefined){
      let closestRate = this.findRate(this.startDate.getTime(), filterRateType);
      if(closestRate !== undefined){
        rateDate.push(closestRate);
        let nearRate =  this.findRate(dateValue, rateDate);
        return nearRate?.rateValue;
      }
    }
    return  nearRate?.rateValue;
  }

  findRate(dateValue: number, tableau: Rate[]): Rate | undefined {
    let nearInteger: Rate | undefined;
    let differenceMin: number | undefined;

    for (const rate of tableau) {
      if (this.convertDate(rate.startDate).getTime() <= dateValue && (differenceMin === undefined || this.convertDate(rate.startDate).getTime() - dateValue >= differenceMin)) {
        nearInteger = rate;
        differenceMin = this.convertDate(rate.startDate).getTime() - dateValue;
      }
    }
    return nearInteger;
  }

  calculateInterestRate(currentDate : Date, nbJours: number): number {
    let isBissextil = this.isYearBisextile(currentDate.getFullYear());
    if(this.filterRate(currentDate.getTime()) !== undefined && this.activeButton !== 3){
      this.ratePercent = this.filterRate(currentDate.getTime())!;
      if(this.ratePercent === 0){
        this.ratePercent = 0;
        return  (this.capital * this.roundNumber((this.ratePercent * this.multiplicationFactor + this.increasedBy), this.roundValue)
         * 0.01 * nbJours ) / (365 + isBissextil) ;
      }
    }
    this.activeButton !== 3 ? this.ratePercent = this.ratePercent : this.ratePercent = this.fixeRate;

    if(this.activeButton === 4 || this.activeButton === 5 ){
      this.isAdjustRate ? this.ratePercent = this.ratePercent + 5 : this.ratePercent = this.ratePercent;
    }
    return  (this.capital *  this.roundNumber((this.ratePercent * this.multiplicationFactor + this.increasedBy), this.roundValue)
     * 0.01 * nbJours ) / (365 + isBissextil) ;
  }

  findNewRate(rate: number){
    let newRate = rate * this.multiplicationFactor + this.increasedBy
    return this.roundNumber(newRate, this.roundValue);
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

  addRow(periodStart: Date, currentDate: Date, nbJours: number, capital: number, taux: number, interestRate: number, interestRateCumulated: number): void {
    const newRow = {
      period: this.convertDateToStringFormat(periodStart) + ' - ' + this.convertDateToStringFormat(currentDate),
      nbJours: nbJours.toString(),
      capital: capital.toString(),
      taux: taux.toString() + '%',
      interestRate: interestRate.toString(),
      interestRateCumulated: interestRateCumulated.toString()
    };

    this.dataSource.data.push(newRow);
    this.dataSource._updateChangeSubscription(); // Notify the table that data has changed
  }

  isYearBisextile(year: number): number {
    if (year % 4 !== 0) {
      return 0;
    } else if (year % 100 !== 0) {
      return 1;
    } else if (year % 400 !== 0) {
      return 0;
    } else {
      return 1;
    }
  }

  // function legalProSearch, legalPartSearch, refiSearch, tmmSearch was in the first version of the project but was always returning false. 
  // I keep them in case of future use.

  legalProSearch(date: number): boolean {
    // let filterRateDate = this.rates.filter((rate: Rate) => rate.type === 'legal_pro');
    // let rate = filterRateDate.find((rate: Rate) => ((this.convertDate(rate.startDate).getTime()) === date));
    // if(rate !== undefined){

    //   return true
    // }
    return false;
  }

  legalPartSearch(date: number): boolean {
    // let rate = this.rates.find((rate: Rate) => ((rate.type === 'legal_particulier') && ((this.convertDate(rate.startDate).getTime()) === date))) ;
    // if(rate !== undefined){
    //   return true
    // }
    return false;
  }

  refiSearch(date: number): boolean {
    // let rate = this.rates.find((rate: Rate) => ((rate.type === 'refi') && ((this.convertDate(rate.startDate).getTime()) === date))) ;
    // if(rate !== undefined){
    //   return true
    // }
    return false;
  }

  tmmSearch(date: number): boolean {
    // let rate = this.rates.find((rate: Rate) => ((rate.type === 'rmm') && ((this.convertDate(rate.startDate).getTime()) === date))) ;
    // if(rate !== undefined){
    //   return true
    // }
    return false;
  }

}

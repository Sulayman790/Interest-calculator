import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ControllerService } from 'src/app/services/controller.service';
import { Rate } from 'src/app/classes/rate';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-legal-rate-form',
  templateUrl: './legal-rate-form.component.html',
  styleUrls: ['./legal-rate-form.component.scss']
})
export class LegalRateFormComponent implements OnInit, OnDestroy {
  legalRateForm!: FormGroup;
  title!: string
  submitName!: string; // Nom du bouton de validation en cas d'ajout ou de suppression
  rates: Rate[] = [];
  newRate = new Rate(); //Objet employé qui sera manipulé dans le formulaire
  adding = false; //Booléen si ajout ou non

  ratesSubscription = new Subscription();

  rateTypes = [
    { value: 'legal_pro', viewValue: 'legal_pro' },
    { value: 'legal_particulier', viewValue: 'legal_particulier' },
    { value: 'refi', viewValue: 'refi' },
    { value: 'tmm', viewValue: 'tmm' },
  ];

  componentVisible = false;
  
  constructor(private fb: FormBuilder, @Inject(MAT_DIALOG_DATA) public data: any, public dialogRef: MatDialogRef<LegalRateFormComponent>,
  private controllerService: ControllerService) { }


  ngOnInit(): void {


    if (this.data.adding) {
      this.legalRateForm = this.fb.group({ //Initialisation du formulaire
        rateTypes: [, Validators.required],
        startDate: ['', [Validators.required, this.startDateValidator()]],
        rateValue: [, [Validators.required, this.rateValueValidator()]]
      });
      this.submitName = "Ajouter"
      this.title = "Créer un taux d'intérêt"
      this.adding = true;
    }
    else {
      this.legalRateForm = this.fb.group({ //Initialisation du formulaire
        rateTypes: [, Validators.required],
        startDate: ['', [Validators.required]],
        rateValue: [, [Validators.required, this.rateValueValidator()]]
      });
      this.submitName = "Modifier"
      this.title = "Modifier un taux d'intérêt"
      this.adding = false;
      this.legalRateForm.patchValue({
        rateTypes: this.data.rate.type,
        startDate: new Date(this.data.rate.startDate.seconds * 1000),
        rateValue: this.data.rate.rateValue
      })
    }
    this.ratesSubscription = this.controllerService.getAllRatesObservable().subscribe((rateFound: Rate[]) => {
      this.rates = rateFound;
      this.componentVisible = true;
    })
  }

  ngOnDestroy(): void {
    this.ratesSubscription.unsubscribe();
  }

  rateValueValidator() {
    return (control: any) => {
      if (control.value === null) {
        return null;
      }
      if(this.isRateValueCorrect(control)) {
        this.legalRateForm.get('rateValue')?.setErrors({ incorrectRateValue: true });
        return { incorrectRateValue: true };
      }
      return null;
    };
  }

  isRateValueCorrect(controlRate: AbstractControl): boolean {
    let rateValue = controlRate.value;
    if(isFinite(rateValue)) {
      if (rateValue < 0 || rateValue > 100) {
        return true;
      }
      return false;
    }
    return true;
  }

  startDateValidator() {
    return (control: any) => {
      if (control.value === null) {
        return null;
      }
      if(this.isDateCorrect(control)) {
        this.legalRateForm.get('startDate')?.setErrors({ incorrectDate: true });
        return { incorrectDate: true };
      }
      return null;
    };
  }

  isDateCorrect(controlDate: AbstractControl): boolean {
    let selectedDate = new Date(controlDate.value);
    if( selectedDate.getTime() === Number.NaN) {
      return true;
    }
    return false;
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

  onSubmit() {
    let form = this.legalRateForm.getRawValue()
    form = {
      startDate: form.startDate,
      rateValue: form.rateValue,
      type: form.rateTypes,
      dateValue: form.startDate.getTime(),
      semester: null,
    }
    Object.assign(this.newRate, form);
    if (this.adding) { // Selon le cas on ajoute ou modifie un nouvel employé sur Firebase et dans la BD
      this.controllerService.addRate(this.newRate);
    }
    else {
      this.controllerService.updateRate(this.newRate);
    }
    this.dialogRef.close();
  }
}

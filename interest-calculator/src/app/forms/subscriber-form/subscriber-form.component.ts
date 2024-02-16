import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { AdminForm } from 'src/app/classes/admin-form';
import { Subscriber } from 'src/app/classes/subscriber';
import { ControllerService } from 'src/app/services/controller.service';

@Component({
  selector: 'app-subscriber-form',
  templateUrl: './subscriber-form.component.html',
  styleUrls: ['./subscriber-form.component.scss']
})
export class SubscriberFormComponent implements OnInit, OnDestroy{
  
  title = ""; //Titre du formulaire
  submitName!: string; //Nom du bouton d'envoi du formulaire
  adding = false; //Booléen si ajout ou non
  newSubscriber = new Subscriber(); //Objet employé qui sera manipulé dans le formulaire
  subscriberForm!: FormGroup;
  isAdmin = false;

  subscribers!: Subscriber[];
  subscribers$ = new Subscription();

  adminForm!: AdminForm[]; //Formulaire administrateur qui aurait pu être une Map

  currentUserId = ""; //ID de l'utilisateur courant 

  constructor(private fb: FormBuilder, private controllerService: ControllerService,
    public dialogRef: MatDialogRef<SubscriberFormComponent>, @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit(): void {
    this.currentUserId = this.controllerService.authService.getCurrentUser(); //On récupère l'ID de l'utilisateur courant
    this.adminForm = [
      {
        value: true,
        name: "Administrateur"
      },
      {
        value: false,
        name: "Utilisateur"
      }
    ];
    this.loadCompleteForm();
  }

  ngOnDestroy(): void {
    this.subscribers$.unsubscribe();
  }

  loadADAccountForm() {
    this.subscriberForm = this.fb.group({ //On initialise le formulaire
      admin: [, Validators.required],
    });
    this.subscribers$ = this.controllerService.getSubscribersObservable().subscribe(subscribersFound => { //On récupère le rôle actuel de l'employé
      this.subscribers = subscribersFound;
      this.newSubscriber = this.controllerService.getObject(this.data.SubscriberId, this.subscribers);
      this.subscriberForm.patchValue({
        admin: this.newSubscriber.admin
      });
      this.title = "Modification du rôle"
      this.submitName = "Modifier"
      this.isUserAdmin(); //On détermine si l'utilisateur est admin ou non
    })
  }

  loadCompleteForm() {
    this.subscriberForm = this.fb.group({
      firstName: [, Validators.required],
      lastName: [, Validators.required],
      email: [, Validators.required],
      admin: [],
      passwords: this.fb.group({
        password: ['', Validators.minLength(6)],
        confirmPassword: ['', Validators.minLength(6)],
      })
    });
    this.subscribers$ = this.controllerService.getSubscribersObservable().subscribe(SubscribersFound => {
      this.subscribers = SubscribersFound;

      if (this.data.adding) {
        this.title = "Créer un(e) Abonné(e)"
        this.submitName = "Ajouter"
        this.adding = true;
        this.subscriberForm.get('passwords')?.get('password')?.setValidators(Validators.required)
        this.subscriberForm.get('passwords')?.get('confirmPassword')?.setValidators(Validators.required)
        this.subscriberForm.patchValue({
          admin: this.adminForm[1].value
        })
      }
      else {
        this.title = "Modifier un(e) Abonné(e)"
        this.submitName = "Modifier"
        this.newSubscriber = this.controllerService.getObject(this.data.subscriberId, this.subscribers)
        this.subscriberForm.patchValue({
          firstName: this.newSubscriber.firstName,
          lastName: this.newSubscriber.lastName,
          email: this.newSubscriber.email,
          admin: this.newSubscriber.admin
        })
      }
      this.isUserAdmin(); //On détermine si l'utilisateur est admin ou non
    })
  }

  arePassWordsValid(): boolean { //On vérifie que les 2 mots de passes aient une valeur
    if (!this.data.adAccount) {
      return !(this.subscriberForm.get(['passwords', 'password'])!.value != this.subscriberForm.get(['passwords', 'confirmPassword'])!.value
        && this.subscriberForm.get(['passwords', 'confirmPassword'])!.value != null)
    }
    return false;
  }

  isEmailValid(): boolean { //On vérifie que l'email soit conforme
    if (!this.data.adAccount) {
      if (this.subscriberForm.getRawValue().email === "") {
        return true;
      }
      return this.subscriberForm.getRawValue().email.toLowerCase()
        .match(
          /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        );
    }
    return false;
  }

  doesThisEmailExist(): boolean { //On vérifie que le mail n'est pas déjà inscrit sur la base de données
    if (!this.data.adAccount) {
      if (this.subscriberForm.getRawValue().email !== null && this.subscriberForm.getRawValue().email !== this.newSubscriber.email) {
        return this.controllerService.doesThisEmailExist(this.subscriberForm.getRawValue().email, this.data.subscribers);
      }
      return false;
    }
    return false;
  }

  isPasswordTooShort() { //On vérifie que le mot de passe n'est pas trop court car il faut minimum 6 caractères pour un compte Firebase/Capteur
    if (!this.data.adAccount) {
      if (!this.data.adding) {
        return false;
      }
      else {
        return this.subscriberForm.getRawValue().passwords.password.length > 0 && this.subscriberForm.getRawValue().passwords.confirmPassword.length > 0
          && this.subscriberForm.getRawValue().passwords.confirmPassword.length < 6 && this.subscriberForm.getRawValue().passwords.confirmPassword.length < 6;
      }
    }
    return false;
  }

  isUserAdmin() { // Vérifie si l'utilisateur courant est administrateur ou non
    let currentUser = this.controllerService.authService.getCurrentUser();
    this.isAdmin = false;

    for (let Subscriber of this.subscribers) {
      if (Subscriber._id === currentUser) {
        if (Subscriber.admin) {
          this.isAdmin = true;
        }
      }
    }
  }

  onSubmit() {
    let form = this.subscriberForm.getRawValue()
    form = {
      lastName: form.lastName,
      firstName: form.firstName,
      fullName: form.firstName + " " + form.lastName,
      email: form.email,
      admin: form.admin
    }
    Object.assign(this.newSubscriber, form);
    if (this.adding) { // Selon le cas on ajoute ou modifie un nouvel employé sur Firebase et dans la BD
      this.newSubscriber.password = this.subscriberForm.getRawValue().passwords.password;
      this.controllerService.addSubscriber(this.newSubscriber);
    }
    else {
      this.controllerService.updateSubscriber(this.newSubscriber);
      let newPassword = this.subscriberForm.getRawValue().passwords.password;
      if (newPassword.length >= 6) {
      }
    }
    this.dialogRef.close();
  }

}

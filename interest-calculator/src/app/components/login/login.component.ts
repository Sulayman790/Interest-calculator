import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ResetPasswordFormComponent } from 'src/app/forms/reset-password-form/reset-password-form/reset-password-form.component';
import { ControllerService } from 'src/app/services/controller.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginForm!: FormGroup;
  loginFirebaseSuccessful = true;
  loginADSuccessful = true;
  isADSetup = false;

  adConfig$ = new Subscription;

  constructor(private controllerService: ControllerService, private fb: FormBuilder, private dialog: MatDialog
    , private router: Router) {
  }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      contact: [, Validators.required],
      password: [, Validators.required],
    });
    if (localStorage.getItem('user') !== null) {
      this.router.navigate(['/home']);
    }
  }

  async authFirebase() {
    let loginResult = await this.controllerService.authService.authFirebase(this.loginForm.getRawValue())
    if (loginResult !== undefined) {
      this.loginFirebaseSuccessful = loginResult;
    }
  }

  isEmailValid(): boolean {
    return this.loginForm.getRawValue().contact.toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  }


  openResetPasswordDialog(): void {
    const dialogRef = this.dialog.open(ResetPasswordFormComponent, {
      autoFocus: false,
      width: '50vw',
    });
  }
}

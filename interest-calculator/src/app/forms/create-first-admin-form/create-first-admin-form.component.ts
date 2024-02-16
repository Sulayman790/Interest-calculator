import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-create-first-admin-form',
  templateUrl: './create-first-admin-form.component.html',
  styleUrls: ['./create-first-admin-form.component.scss']
})
export class CreateFirstAdminFormComponent {
  firstAdminForm!: FormGroup;


  constructor(private fb: FormBuilder, public dialogRef: MatDialogRef<CreateFirstAdminFormComponent>, @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit(): void {
    this.firstAdminForm = this.fb.group({ //On initialise le formulaire
      newAdminID: ["", Validators.required],
    });
  }

  onSubmit(){
    let newAdminID = this.firstAdminForm.getRawValue().newAdminID;
    this.dialogRef.close({ newAdminID: newAdminID });
  }

}

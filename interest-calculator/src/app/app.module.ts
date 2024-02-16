import { NgModule, LOCALE_ID } from '@angular/core';
import { MomentDateAdapter, MAT_MOMENT_DATE_FORMATS } from '@angular/material-moment-adapter';

import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { HttpClient, HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';
import { AdminComponent } from './components/admin/admin.component';
import { RateComponent } from './components/rate/rate.component';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { environment } from '../environments/environment';
import { ScreenTrackingService,UserTrackingService } from '@angular/fire/analytics';
import { provideFirestore,getFirestore } from '@angular/fire/firestore';
import { LoginComponent } from './components/login/login.component';
import { FormsModule } from '@angular/forms';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { AngularFireStorageModule } from '@angular/fire/compat/storage';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { AngularFireDatabaseModule } from '@angular/fire/compat/database';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDialogModule } from '@angular/material/dialog';
import { CreateFirstAdminFormComponent } from './forms/create-first-admin-form/create-first-admin-form.component';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MAT_DATE_LOCALE, MatNativeDateModule } from '@angular/material/core';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatInputModule } from '@angular/material/input';
import { CalendarModule } from 'primeng/calendar';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import {MatListModule} from '@angular/material/list';
import { MultiSelectModule } from 'primeng/multiselect';
import { EditorModule } from 'primeng/editor';
import { AccordionModule } from 'primeng/accordion';
import { DropdownModule } from 'primeng/dropdown';
import { ResetPasswordFormComponent } from './forms/reset-password-form/reset-password-form/reset-password-form.component';
import { ReactiveFormsModule } from '@angular/forms';
import {MatDatepickerModule} from '@angular/material/datepicker';
import { LegalRateFormComponent } from './forms/legal-rate-form/legal-rate-form/legal-rate-form.component';
import { SubscriberFormComponent } from './forms/subscriber-form/subscriber-form.component';

import * as firebase from 'firebase/app';
firebase.initializeApp(environment.firebase);

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    AdminComponent,
    RateComponent,
    LoginComponent,
    CreateFirstAdminFormComponent,
    ResetPasswordFormComponent,
    LegalRateFormComponent,
    SubscriberFormComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideFirestore(() => getFirestore()),
    AngularFireModule.initializeApp(environment.firebase),
    MatToolbarModule,
    BrowserAnimationsModule,
    MatDialogModule,
    MatMenuModule,
    MatDividerModule,
    MatSelectModule,
    MatIconModule,
    MatNativeDateModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatInputModule,
    CalendarModule,
    MatButtonModule,
    MatRippleModule,
    MatListModule,
    MultiSelectModule,
    EditorModule,
    AccordionModule,
    DropdownModule,
    AngularFireAuthModule,
    AngularFireStorageModule,
    AngularFirestoreModule,
    AngularFireDatabaseModule,
    ReactiveFormsModule,
    MatDatepickerModule,
  ],
  providers: [
    ScreenTrackingService,UserTrackingService,
    { provide: MAT_DATE_LOCALE, useValue: 'en-GB' }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

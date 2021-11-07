import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { QuizComponent } from './components/quiz/quiz.component';
import { InfoZApiComponent } from './components/info-z-api/info-z-api.component';
import { TranslatebreedPipe } from './pipes/translatebreed.pipe';
import { MainComponent } from './components/main/main.component';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {AngularFireModule} from "@angular/fire/compat";
import {environment} from "../environments/environment";
import {AngularFirestoreModule} from "@angular/fire/compat/firestore";
import {AngularFireDatabaseModule} from "@angular/fire/compat/database";
import {HttpClientModule} from "@angular/common/http";
import { LetDirective } from './let.directive';
import { TablicaRekordowComponent } from './components/tablica-rekordow/tablica-rekordow.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@NgModule({
  declarations: [
    AppComponent,
    QuizComponent,
    InfoZApiComponent,
    TranslatebreedPipe,
    MainComponent,
    LetDirective,
    TablicaRekordowComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule,
    AngularFireDatabaseModule,
    ReactiveFormsModule,
    HttpClientModule,
    ReactiveFormsModule,
    FontAwesomeModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

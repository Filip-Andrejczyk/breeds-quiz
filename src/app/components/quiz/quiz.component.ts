import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {InfoZApiComponent} from "../info-z-api/info-z-api.component";
import {Observable} from "rxjs";
import {DogsRandomService} from "../../services/dogs-random.service";
import {JedenWybranyPiesService} from "../../services/jeden-wybrany-pies.service";
import {TablicaLstorageService} from "../../services/tablica-lstorage.service";
import {CurrentPlayerService} from "../../services/current-player.service";
import {RekordyFirebaseService} from "../../services/rekordy-firebase.service";
import {Rekord} from "../../models/rekordy";

@Component({
  selector: 'app-quiz',
  templateUrl: './quiz.component.html',
  styleUrls: ['./quiz.component.css']
})
export class QuizComponent implements OnInit {

  goodAnswerBreed$: Observable<string> | undefined;
  allObservable$: Observable<string[]> | undefined;
  losowe$: Observable<string[]> | undefined;
  czteryodp$: Observable<string[]> | undefined;

  public poprawny: string = "";

  public liczdobre: number = 0;
  public personalBest: number = 0;

  public dogForm: FormGroup = this.fb.group({});
  public stringStyle: string = "btn-default";
  public div: string = "";

  public dogSelected: boolean = false;
  public isuserName: boolean | undefined;

  public przegrana: boolean | undefined;

  public clicked: boolean = false;
  public isHard: boolean = false;

  public timeForAnswer: number = 8;
  public interval: number = 0;

  public currentPlayaID: string = "";
  public personalBestFirebase: number = 0;

  public rekordy: Rekord[] = [];

  public inputPlaceholder: string = "";

  constructor(
    private infozapicomponent: InfoZApiComponent,
    private cdRef: ChangeDetectorRef,
    private fb: FormBuilder,
    private dogsRandomService: DogsRandomService,
    private jedenWybranyPiesService: JedenWybranyPiesService,
    private tablicaLStorageService: TablicaLstorageService,
    private currentPlayerService: CurrentPlayerService,
    private rekordyAPI: RekordyFirebaseService,
  )
  {
    this.goodAnswerBreed$ = this.jedenWybranyPiesService.breed$;
    this.allObservable$ = this.dogsRandomService.wszystkieRasy$;
  }

  ngOnInit(): void {

    this.goodAnswerBreed$?.subscribe(ta => this.poprawny = ta);
    this.currentPlayerService.dataBoolean$.subscribe(hard => this.isHard = hard);
    this.currentPlayerService.wyswietlajEkranDoWpisaniaUzytkownika$.subscribe(wartosc => this.isuserName = wartosc);
    this.currentPlayerService.przegrana$.subscribe(wart => this.przegrana = wart);

    this.losowe$ = this.dogsRandomService.trzylosowe$;
    this.czteryodp$ = this.dogsRandomService.odpowiedzi$;

    let recordsFromFirebase = this.rekordyAPI.getWynikiEz();
    recordsFromFirebase.snapshotChanges().subscribe(data => {
      this.rekordy = [];
      data.forEach(item => {
        let rekord: Rekord = item.payload.toJSON() as Rekord;
        if (typeof item.key === 'string'){
          rekord.$key = item.key;
        }
        this.rekordy?.push(rekord as Rekord);
      })
    })

  }

  formu = new FormGroup({
    gender: new FormControl('', Validators.required)
  });

  login = new FormGroup({
    username: new FormControl('', Validators.required)
  });

  get f() {
    return this.formu.controls;
  }

  setDificultyLvl(lvl: boolean){
    this.currentPlayerService.dataBoolSource.next(lvl);
  }

  newUser(){
    this.currentPlayerService.statusPrzegranej(false);
    this.login.value.username = "";
    this.infozapicomponent.nextPieselek();
    this.currentPlayerService.gameIsRunning(true);
    this.currentPlayerService.resetujLicznik();
    this.currentPlayerService.wyswietlajEkranDoWpisaniaUzytkownika(false);
  }

  tryAgain(){
    this.currentPlayerService.statusPrzegranej(false);
    this.infozapicomponent.nextPieselek();
    this.currentPlayerService.gameIsRunning(true);
    this.currentPlayerService.resetujLicznik();
    if (this.isHard){
      this.startTimer();
    }
  }

  koniecGry(){
    //this.isuserName = false;
    this.currentPlayerService.statusPrzegranej(false);
    this.currentPlayerService.saveData("");
    this.currentPlayerService.wyswietlajEkranDoWpisaniaUzytkownika(false);
    this.currentPlayerService.resetujLicznik();
  }

  udzielonoDobrejOdpowiedzi(){
    this.liczdobre++;
    if (this.isHard){
      this.stopTimer();
    }
    setTimeout(() => {
      this.dogSelected = false;
      this.infozapicomponent.nextPieselek();
      this.clicked = false;
      this.startTimer();
    }, 2000);
  }

  udzielonoZlejOdpowiedzi(fast = false){

    this.liczdobre = 0;
    if (this.isHard) {this.stopTimer();}

    if (!fast) {
      setTimeout(
        () => {
          this.dogSelected = false;
          this.currentPlayerService.statusPrzegranej(true);
          this.clicked = false;
          this.currentPlayerService.gameIsRunning(false);
        }, 2000);
    }
    else {
      this.dogSelected = false;
      this.currentPlayerService.statusPrzegranej(true);
      this.clicked = false;
    }
  }

  startTimer(){
    if (this.isHard){
      this.timeForAnswer = 8;
      this.interval = setInterval(() => {

        if (this.timeForAnswer > 0) {
          this.timeForAnswer--;
        }
        else {
          this.stopTimer();
          this.udzielonoZlejOdpowiedzi(true);
        }
      }, 1000)
    }
  }

  stopTimer(){
    clearInterval(this.interval);
  }

  submit() {
    this.dogSelected = true;
    this.clicked = true;

    if (this.formu.value.gender == this.poprawny)
    {
      this.udzielonoDobrejOdpowiedzi();
    }
    else
    {
      this.udzielonoZlejOdpowiedzi();
    }

    if (!this.isHard)
    {
      if (this.liczdobre > this.personalBestFirebase)
      {
        this.rekordyAPI.updateRekord(this.login.value.username, this.liczdobre, this.currentPlayaID);
        this.personalBest = this.liczdobre;
      }
    }
    else
    {
      this.tablicaLStorageService.sendData(this.tablicaLStorageService.updateRecord(this.login.value.username, this.liczdobre, this.isHard), this.isHard);
    }

    this.formu.reset();
  }

  submit2() {
    this.currentPlayerService.gameIsRunning(true);
    if (this.login.value.username == "")
    {
      this.currentPlayerService.wyswietlajEkranDoWpisaniaUzytkownika(false);
      this.inputPlaceholder = "      UZUPEŁNIJ POLE"
    }
    else
    {
      this.currentPlayerService.wyswietlajEkranDoWpisaniaUzytkownika(true);
      this.liczdobre = 0;
      this.currentPlayerService.saveData(this.login.value.username);

      if(!this.isHard){
        if(this.rekordy.find(x => x.name == this.login.value.username) !== undefined){
          console.log("istnieje");
        }else{
          this.rekordyAPI.addEZRekord(this.login.value.username, this.liczdobre);
        }
      }else{
        if (!this.tablicaLStorageService.findUser(this.login.value.username, this.isHard))
        {
          this.tablicaLStorageService.sendData(this.tablicaLStorageService.addRecord(this.login.value.username, this.liczdobre, this.isHard), this.isHard);
        }
        else
        {
          this.personalBest = this.tablicaLStorageService.PersonalBest(this.login.value.username, this.isHard);
        }
      }

      let recordsFromFirebase = this.rekordyAPI.getWynikiEz();
      recordsFromFirebase.snapshotChanges().subscribe(data => {
        this.rekordy = [];
        data.forEach(item => {
          let rekord: Rekord = item.payload.toJSON() as Rekord;
          if (typeof item.key === 'string'){
            rekord.$key = item.key;
          }
          this.rekordy?.push(rekord as Rekord);
        })
        let ind = this.rekordy.findIndex(x => x.name == this.login.value.username);
        this.currentPlayaID = this.rekordy[ind].$key;
        this.personalBestFirebase = this.rekordy[ind].score;
      })
    }

    if (this.isHard){
      this.startTimer();
    }

  }
}




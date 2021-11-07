import { Component, OnInit } from '@angular/core';
import { Rekord } from "../../models/rekordy";
import { switchMap } from "rxjs/operators";
import { BehaviorSubject, Observable } from "rxjs";
import { CurrentPlayerService } from "../../services/current-player.service";
import { RekordyFirebaseService } from "../../services/rekordy-firebase.service";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import {TablicaLstorageService} from "../../services/tablica-lstorage.service";

@Component({
  selector: 'app-tablica-rekordow',
  templateUrl: './tablica-rekordow.component.html',
  styleUrls: ['./tablica-rekordow.component.css']
})

export class TablicaRekordowComponent implements OnInit {

  tablicaTrybTrudny$: Observable<Rekord[]> | undefined;

  refreshUsers$ = new BehaviorSubject<boolean>(true);

  rekordy: Rekord[] = [];
  hideWhenNoRecords: boolean = false;
  noData: boolean = false;
  preLoader: boolean = true;

  public kliknietoEdytuj: boolean = false;
  public przegrana: boolean | undefined;
  public usrIndex: number = 0;
  public statusUsuniecia: string = "";
  public prawidlowyGracz = true;

  public gracz: string = "";
  public faTimes = faTimes;
  public trybHard: boolean = false;

  public napisLatwy: string = "EASY MODE";
  public napisTrudny: string = "HARD MODE";

  public graRunning: boolean = false;


  constructor(
              private tablicaLStorageServive: TablicaLstorageService,
              private currentPlayerService: CurrentPlayerService,
              private rekordyApi: RekordyFirebaseService,
  )
  {
    this.currentPlayerService.dataString$.subscribe(nazwa => this.gracz = nazwa);
    this.currentPlayerService.dataBoolean$.subscribe(tryb => this.trybHard = tryb);
    this.currentPlayerService.gameStatus$.subscribe(status => this.graRunning = status);
    this.currentPlayerService.przegrana$.subscribe(stat => this.przegrana = stat);
  }

  ngOnInit(): void {

    this.tablicaTrybTrudny$ = this.refreshUsers$.pipe(switchMap(_ => this.tablicaLStorageServive.getHardRecords()));

    this.dataState();
    let rekordyAll = this.rekordyApi.getWynikiEz();
    rekordyAll.snapshotChanges().subscribe(data => {
      this.rekordy = [];
      data.forEach(item => {
        let rekord: Rekord = item.payload.toJSON() as Rekord;
        if (typeof item.key === 'string'){
          rekord.$key = item.key;
        }
        this.rekordy?.push(rekord as Rekord);
        this.rekordy.sort((a, b) => {return b.score - a.score});
      })
    })
  }


  dataState(){
    this.rekordyApi.getWynikiEz().valueChanges().subscribe(data => {
      this.preLoader = false;
      if(data.length <= 0){
        this.hideWhenNoRecords = false;
        this.noData = true;
      }else{
        this.hideWhenNoRecords = true;
        this.noData = false;
      }
    })
  }

  edytujClikc(): void{
    this.kliknietoEdytuj = !this.kliknietoEdytuj;
  }

  usunRekord(name: string, key: string, isHard: boolean, nr: number): void{

    let curentUserName = this.gracz;

    // this.usrIndex = this.tablicaLStorageServive.tablicaTrybHARD.findIndex((obj => obj.name == curentUserName));
    // this.tablicaLStorageServive.sendData(this.tablicaLStorageServive.removeRecord(nr, isHard), this.trybHard);

    if(!isHard){
      if (curentUserName === name)
      {
        this.rekordyApi.deleteRekordEz(key);
        this.currentPlayerService.saveData("");
        this.currentPlayerService.wyswietlajEkranDoWpisaniaUzytkownika(false);
        this.currentPlayerService.statusPrzegranej(false);
      }
      else{
        this.prawidlowyGracz = false;
        this.statusUsuniecia = "You cannot delete someone else's record";
      }
    }
    else
    {
      if(curentUserName !== "admin69"){
        this.prawidlowyGracz = false;
        this.statusUsuniecia = "You cannot delete a record in hard mode " + this.gracz + " hamie";
        setTimeout(() => {this.edytujClikc()}, 3700);
      }else{
        this.tablicaLStorageServive.sendData(this.tablicaLStorageServive.removeRecord(nr, isHard), this.trybHard);
      }
    }
    setTimeout(() => {this.prawidlowyGracz = true}, 3700);
  }

}



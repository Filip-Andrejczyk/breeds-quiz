import { Injectable } from '@angular/core';
import { BehaviorSubject } from "rxjs";
import { JedenWybranyPiesService } from "./jeden-wybrany-pies.service";

@Injectable({
  providedIn: 'root'
})
export class CurrentPlayerService {

  nazwagracza: string = "";
  trybHard: boolean = false;
  gameInProgress: boolean = true;

  zostaloPominiec: number = 3;
  koniecPomijania: boolean = false;
  //isUsername: boolean = false;

  private dataStringSource = new BehaviorSubject<string>("");
  public dataBoolSource = new BehaviorSubject<boolean>(false);
  public runningGameSubject = new BehaviorSubject<boolean>(true);

  public liczaPominiecSubject = new BehaviorSubject<number>(3);
  public koniecPomijaniaSubject = new BehaviorSubject<boolean>(false);

  public wyswietlajEkranDoWpisaniaUzytkownikaSubject = new BehaviorSubject<boolean>(false);
  public przegranaSubject = new BehaviorSubject<boolean>(false);

  public dataBoolean$ = this.dataBoolSource.asObservable();
  public dataString$ = this.dataStringSource.asObservable();

  public liczbaPominiec$ = this.liczaPominiecSubject.asObservable();
  public stopPomijania$ = this.koniecPomijaniaSubject.asObservable();
  public wyswietlajEkranDoWpisaniaUzytkownika$ = this.wyswietlajEkranDoWpisaniaUzytkownikaSubject.asObservable();
  public przegrana$ = this.przegranaSubject.asObservable();

  public gameStatus$ = this.runningGameSubject.asObservable();

  constructor(
    private jedenWybranyPiesService: JedenWybranyPiesService
  ) {}

  public saveData(value: string){
    this.nazwagracza = value;
    this.dataStringSource.next(this.nazwagracza);
  }

  public gameIsRunning(value: boolean){
    this.gameInProgress = value;
    this.runningGameSubject.next(this.gameInProgress);
  }

  clickKolejnyPieselek(){
    if(this.zostaloPominiec > 0)
    {
      this.jedenWybranyPiesService.changeRandomDog.next();
      this.zostaloPominiec--;
      this.liczaPominiecSubject.next(this.zostaloPominiec);
    }
    if (this.zostaloPominiec == 0)
    {
      this.koniecPomijania = true;
      this.koniecPomijaniaSubject.next(true);
    }
  }
  resetujLicznik(){
    this.zostaloPominiec = 3;
    this.liczaPominiecSubject.next(this.zostaloPominiec);
    this.koniecPomijaniaSubject.next(false);
  }

  wyswietlajEkranDoWpisaniaUzytkownika(value: boolean){
    this.wyswietlajEkranDoWpisaniaUzytkownikaSubject.next(value);
  }

  statusPrzegranej(value: boolean){
    this.przegranaSubject.next(value);
  }


}

import { Injectable } from '@angular/core';
import {GetApiService} from "./get-api.service";
import {map, switchMap} from "rxjs/operators";
import {Observable, ReplaySubject} from "rxjs";
import {JedenWybranyPiesService} from "./jeden-wybrany-pies.service";

@Injectable({
  providedIn: 'root'
})
export class DogsRandomService {

  public wszystkieRasy$: Observable<string[]>;
  public trzylosowe$: Observable<string[]>;
  public tenjedenjedyny$: Observable<string>;
  public odpowiedzi$: Observable<string[]>;
  public wszystkieRasyBezWybranego$: Observable<string[]>;

  refreshAnswerSrc: ReplaySubject<{ except: string }> = new ReplaySubject(1);

  constructor(private api: GetApiService, private jedenWybranyPiesService: JedenWybranyPiesService)
  {
    this.tenjedenjedyny$ = this.jedenWybranyPiesService.breed$;
    this.wszystkieRasy$ = this.getBreeds();
    this.wszystkieRasyBezWybranego$ = this.usunDobraOdpZPuliDoLosowania();
    this.trzylosowe$ = this.wylosujDogs();
    this.odpowiedzi$ = this.appendAndShuffle();
    this.refreshAnswers();
  }

  getBreeds(): Observable<string[]>
  {
    return this.api.allBreeds().pipe(map((rasy) => rasy.message),
      map(breeds => {
        const notFlattenBreeds = Object.entries(breeds).map(([breed, subBreeds])=>{
          return subBreeds.length === 0 ? breed : subBreeds.map(subBreed => `${breed}-${subBreed}`)
        });
        return ([] as string[]).concat(...notFlattenBreeds);
      }));
  }

  wylosujDogs(): Observable<string[]>
  {
    return this.refreshAnswerSrc.pipe(
      switchMap(()=>this.wszystkieRasyBezWybranego$),
      map(allBreeds => this.chooseThreedogz(allBreeds))
    );
  }

  usunDobraOdpZPuliDoLosowania(): Observable<string[]>
  {
    return this.tenjedenjedyny$.pipe(
      switchMap(wybranypiesek => this.wszystkieRasy$.pipe(map(rasy => this.usunZTablicy(rasy, wybranypiesek)))));
  }

  appendAndShuffle(): Observable<string[]>
  {
    return this.tenjedenjedyny$.pipe(
      switchMap(jeden=>this.trzylosowe$.pipe(map(trzylosowe=>([...trzylosowe, jeden])))),
      map((czteryOdp) => this.shuffleArray(czteryOdp))
    );
  }

  public refreshAnswers(): void
  {
    this.refreshAnswerSrc.next();
  }

  chooseThreedogz(array: string[]): string[]
  {
    let n=3
    let threeRandomDogs = new Array(n)
    let len = array.length;
    let taken = new Array(len);
    while (n--) {
      let x = Math.floor(Math.random() * len);
      threeRandomDogs[n] = array[x in taken ? taken[x] : x];
      taken[x] = --len in taken ? taken[len] : len;
    }
    return threeRandomDogs;
  }

  usunZTablicy(tablica: string[], element: string): string[]{
    let ind = tablica.indexOf(element);
    tablica.splice(ind, 1);
    return tablica;
  }

  shuffleArray(array: string[]): string[]
  {
    var currentIndex = array.length,  randomIndex;

    while (currentIndex != 0) {

      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }

    return array;
  }

}




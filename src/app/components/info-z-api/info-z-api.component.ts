import { Component, ViewChild, AfterViewInit} from '@angular/core';
import {GetApiService} from "../../services/get-api.service";
import {Observable} from "rxjs";
import {DogsRandomService} from "../../services/dogs-random.service";
import {QuizComponent} from "../quiz/quiz.component";
import {JedenWybranyPiesService} from "../../services/jeden-wybrany-pies.service";
import {CurrentPlayerService} from "../../services/current-player.service";


@Component({
  selector: 'app-info-z-api',
  templateUrl: './info-z-api.component.html',
  styleUrls: ['./info-z-api.component.css'],
})
export class InfoZApiComponent implements AfterViewInit {

  doggoImgPath$: Observable<string> | undefined;
  rasa$: Observable<any> | undefined;

  public zostaloPominiec: number = 0;
  public koniecPomijania: boolean = false;
  public trybTrudny: boolean = false;

  @ViewChild(QuizComponent) child: { wylosujPieski: () => any; } | undefined;

  constructor(private api: GetApiService,
              private dogsRandomService: DogsRandomService,
              private jedenWybranyPiesService: JedenWybranyPiesService,
              private currentPlayerService: CurrentPlayerService
  ) {
    this.currentPlayerService.dataBoolean$.subscribe(tryb => this.trybTrudny = tryb);
    this.currentPlayerService.liczbaPominiec$.subscribe(liczba => this.zostaloPominiec = liczba);
    this.currentPlayerService.stopPomijania$.subscribe(stat => this.koniecPomijania = stat);
  }

  ngAfterViewInit(): void
  {
    this.nextPieselek();
    this.doggoImgPath$ = this.jedenWybranyPiesService.dogeImgPath$;
    this.rasa$ = this.jedenWybranyPiesService.breed$;
  }

  nextPieselek(): void
  {
    this.jedenWybranyPiesService.changeRandomDog.next();
  }

  nextPieselekPrzycisk(): void
  {
    this.currentPlayerService.clickKolejnyPieselek();
  }

}




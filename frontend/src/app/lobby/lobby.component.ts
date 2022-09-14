import { Component, OnInit } from '@angular/core';
import { GameService } from '../game/game.service';

interface Mode {
  value: string;
  viewValue: string
}

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.css']
})
export class LobbyComponent implements OnInit {

  selected: string = 'normal';

  modes: Mode[] = [
    { value: 'normal', viewValue: 'Normal' },
    { value: 'easy', viewValue: 'Easy'},
    { value: 'hardcore', viewValue: 'Hardcore' },
    { value: 'dual', viewValue: 'Dual ball' },
  ];

  constructor(private gameService: GameService) { }

  ngOnInit(): void {
  }

  onJoinWaitlistClick() {
    this.gameService.joinWaitlist(this.selected);
  }

}

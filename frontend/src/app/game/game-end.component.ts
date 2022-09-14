import { Component, OnInit } from '@angular/core';
import { GameService } from './game.service';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { MatchHistoryService } from 'src/app/match-history/match-history.service';
import { IMatch } from '../match-history/match.interface';
import { AuthService } from '../auth/auth.service';
import { UserService } from '../user/user.service';
import { IUser } from '../user/user.interface';

@Component({
  selector: 'app-game-end',
  templateUrl: './game-end.component.html',
  styleUrls: ['./game-end.component.css']
})
export class GameEndComponent implements OnInit {

  matchResult: IMatch;
  player1name: string;
  player2name: string;

  constructor(
    private matDialogRef: MatDialogRef<GameEndComponent>,
    private gameService: GameService,
    private router: Router,
    private auth: AuthService,
    private userService: UserService,
  ) { 
    this.gameService.getFinalScore().subscribe((val: IMatch) => {
      this.matchResult = val;
    });
    this.userService.getUser(this.matchResult.player1Id).subscribe((val: IUser) => {
      this.player1name = val.name;
    });
    this.userService.getUser(this.matchResult.player2Id).subscribe((val: IUser) => {
      this.player2name = val.name;
    });
  }

  ngOnInit(): void { }

  backWaitList(){
    this.closeDialog();
    this.router.navigate(['/lobby/']);
  }
  
  backHome(){
    this.closeDialog();
    this.router.navigate(['/user/' + this.auth.getId()]);
  }

  closeDialog(){
    this.matDialogRef.close();
  }

}

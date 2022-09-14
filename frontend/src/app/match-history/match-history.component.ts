import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GameMode } from '../game/game.component';
import { IUser } from '../user/user.interface';
import { UserService } from '../user/user.service';
import { MatchHistoryService } from './match-history.service';
import { IMatch } from './match.interface';

@Component({
  selector: 'app-match-history',
  templateUrl: './match-history.component.html',
  styleUrls: ['./match-history.component.css']
})
export class MatchHistoryComponent implements OnInit {
  userId: number = 0;
  user: IUser = {} as IUser;
  otherUsers: IUser[] = [];
  matchHistory: IMatch[];
  avatarUrl: string = "";

  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    private matchService: MatchHistoryService,
    private router: Router) {
      this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    }

  ngOnInit(): void {
    const routeParams = this.route.snapshot.paramMap;
    this.userId = Number(routeParams.get('id'));
    this.userService.getUser(this.userId).subscribe((user) => {
      this.user = user;
      this.avatarUrl = this.userService.selectAvatarUrl(this.user);
    })
    this.matchService.getMatchHistory(this.userId).subscribe((matchHistory) => {
      this.matchHistory = matchHistory;
      // Get only unique user ids in all matches
      var ids: number[] = this.matchHistory.map(match => match.player1Id);
      ids = ids.concat(this.matchHistory.map(match => match.player2Id));
      ids = ids.filter((value, index, self) => self.indexOf(value) === index);
      if (ids.length) {
        this.userService.getSomeUsers(ids).subscribe((otherUsers) => {
          this.otherUsers = otherUsers;
        });
      }
    })
  }

  getPlayerAvatar(playerId: number) {
    if (playerId == this.userId) {
      return this.avatarUrl;
    }
    else {
      return this.otherUsers.find(user => user.id == playerId)?.avatar42Url;
    }
  }

  getName(id: number) {
    if (id == this.userId) {
      return this.user?.name;
    } else {
      return this.otherUsers.find(user => user.id === id)?.name;
    }
  }

  isWon(match: IMatch) {
    return match.winnerId === this.userId;
  }

  getWinStatus(match: IMatch) {
    if (this.isWon(match)) {
      return "Won"
    } else {
      return "Lost"
    }
  }

  getModeString(mode: GameMode) {
    if (mode == GameMode.NORMAL) {
      return "Normal"
    } else if (mode == GameMode.EASY) {
      return "Easy"
    } else if (mode == GameMode.HARDCORE) {
      return "Hardcore"
    } else {
      return "Dual"
    }
  }

}

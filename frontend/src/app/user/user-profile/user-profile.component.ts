import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, IsActiveMatchOptions, Router } from '@angular/router';
import { AuthService } from 'src/app/auth/auth.service';
import { GameMode } from 'src/app/game/game.component';
import { GameService, StatusesDto } from 'src/app/game/game.service';
import { MatchHistoryService } from 'src/app/match-history/match-history.service';
import { IMatch } from 'src/app/match-history/match.interface';
import { IStats } from 'src/app/match-history/stats.interface';
import { IUser } from '../user.interface';
import { UserService } from '../user.service';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit, OnDestroy {

  userId: number = 0;
  user: IUser = {} as IUser;
  friends = [] as IUser[];
  statuses: StatusesDto;
  avatarUrl: string = "";
  idMatches: boolean = false;
  userStats: IStats[];
  room: string = "";
  private timer: any;
  ranking: number;

  constructor(
    public userService: UserService,
    private route: ActivatedRoute,
    private router: Router,
    public auth: AuthService,
    private matchHistory: MatchHistoryService,
    private gameService: GameService
  ) {
    // This is needed to reload the component when changing users directly
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
  }


  ngOnInit(): void {
    const routeParams = this.route.snapshot.paramMap;
    this.userId = Number(routeParams.get('id'));
    this.userService.getUser(this.userId).subscribe((user) => {
      this.user = user;
      this.idMatches = user.id == this.auth.getId();
      this.avatarUrl = this.userService.selectAvatarUrl(this.user);
    });
    this.matchHistory.getStats(this.userId).subscribe(stats => this.userStats = stats);
    this.userService.getFriends(this.userId).subscribe(friends => {
      this.friends = friends;
    });
    this.gameService.getRoomById(this.userId).subscribe(room => {
      this.room = room;
    });
    this.gameService.requestStatusChange();
    this.timer = setInterval(() => {
      this.gameService.requestStatusChange();
    }, 4000);
    this.gameService.statusChange.subscribe((statuses: StatusesDto) => {
      this.statuses = statuses;
    })
    this.getRanking(this.userId);
  }

  ngOnDestroy(): void {
    clearInterval(this.timer);
  }

  onProfileEdit() {
    this.router.navigate(['/user/' + this.userId + '/edit']);
  }

  updateUser() {
    this.userService.getUser(this.auth.getId()).subscribe(user => this.user = user);
    this.userService.getFriends(this.userId).subscribe(friends => this.friends = friends);
    this.gameService.requestStatusChange();
  }

  addFriend(friendId: number) {
    this.userService.addFriend(this.auth.getId(), friendId).subscribe(() => {
      setTimeout(() => { this.updateUser() }, 100);
    });
  }

  removeFriend(friendId: number) {
    this.userService.removeFriend(this.auth.getId(), friendId).subscribe(() => {
      setTimeout(() => { this.updateUser() }, 100);
    });
  }

  isFriend(friendId: number) {
    return this.user?.friends?.includes(friendId);
  }

  onMatchHistoryLink() {
    this.router.navigate(['/user/' + this.userId + '/history']);
  }

  isPlaying() {
    if (this.room) {
      return this.room.length !== 0;
    }
    return false;
  }

  watchGame() {
    this.gameService.joinSpectate(this.room);
  }

  isStatusPlay(id: number) {
    return this.statuses?.playing.find(playingId => { return id === playingId }) != undefined;
  }

  isStatusConnected(id: number): boolean {
    return this.statuses?.connected.find(connectedId => { return id === connectedId }) != undefined;
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

  onladderListLink() {
    this.router.navigate(['/user/' + this.userId + '/ladderList']);
  }

  getRanking(userId: number) {
    let ladderList: IUser[];
    this.userService.getLadderList().subscribe((data) => {
      ladderList = data;
      this.ranking = this.userService.getRanking(userId, ladderList);
    });
  }

  isProfileTheUser() {
    return this.auth.getId() == this.user.id;
  }

}

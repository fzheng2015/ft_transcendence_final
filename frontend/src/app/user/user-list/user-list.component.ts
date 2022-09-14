import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from 'src/app/auth/auth.service';
import { GameService, StatusesDto} from 'src/app/game/game.service';
import { IUser } from '../user.interface';
import { UserService } from '../user.service';


@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit, OnDestroy {
  loggedInUser: IUser | undefined;
  users: IUser[];
  statuses: StatusesDto;
  private timer: any;

  constructor(
    public userService: UserService,
    private auth: AuthService,
    private gameService: GameService
    ) { }

  ngOnInit(): void {
    this.updateUser();
    this.updateUsers();
    this.gameService.requestStatusChange();
    this.timer = setInterval(()=> {
      this.gameService.requestStatusChange();
    }, 4000);
    this.gameService.statusChange.subscribe((statuses: StatusesDto) => {
      this.statuses = statuses;
    })
  }
 
  ngOnDestroy(): void {
    clearInterval(this.timer);
  }

  updateUser() {
    this.userService.getUser(this.auth.getId()).subscribe(user => this.loggedInUser = user);
  }

  updateUsers() {
    this.userService.getUsers().subscribe(users => this.users = users);
  }

  addFriend(friendId: number) {
    this.userService.addFriend(this.auth.getId(), friendId).subscribe(() => {
      setTimeout(() => {this.updateUser()}, 100);
    });
  }

  removeFriend(friendId: number) {
    this.userService.removeFriend(this.auth.getId(), friendId).subscribe(() => {
      setTimeout(() => {this.updateUser()}, 100);
    });
  }

  isFriend(friendId: number) {
    return this.loggedInUser?.friends?.includes(friendId);
  }

  isStatusPlay(id: number) {
    return this.statuses?.playing.find(playingId => {return id === playingId}) != undefined;
  }

  isStatusConnected(id: number): boolean {
    return this.statuses?.connected.find(connectedId => {return id === connectedId}) != undefined;    
  }

}

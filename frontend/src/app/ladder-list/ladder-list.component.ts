import { Component, OnInit } from '@angular/core';
import { IUser } from '../user/user.interface';
import { UserService } from '../user/user.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-ladder-list',
  templateUrl: './ladder-list.component.html',
  styleUrls: ['./ladder-list.component.css']
})
export class LadderListComponent implements OnInit {

  ladderList = [] as IUser[];
  ranking: number[] = [];
  userId: number;

  constructor(
    private userService: UserService,
    private route: ActivatedRoute,
  ) { }

  ngOnInit(): void {

    const routeParams = this.route.snapshot.paramMap;
    this.userId = Number(routeParams.get('id'));

    this.getLadderListAndRanking();
  }

  getPlayerAvatar(user: IUser) {
    return this.userService.selectAvatarUrl(user);
  }

  getLadderListAndRanking() {
    this.userService.getLadderList().subscribe((data) => {
      this.ladderList = data;
      let i = 0;
      for (let ladder of this.ladderList) {
        if (i != 0 && ladder.win === this.ladderList[i - 1].win) {
          let l = this.ranking.length - 1;
          this.ranking.push(this.ranking[l]);
        }
        else {
          this.ranking.push(i + 1);
        }
        i++;
      }
    });
  }

}

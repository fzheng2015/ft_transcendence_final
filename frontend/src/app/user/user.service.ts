import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable, of} from 'rxjs';
import { IUser } from './user.interface'
import { environment } from 'src/environments/environment';

const apiUrl: string = environment.BACKEND_URL_API + 'user/';

interface UpdateNameDto {
  name: string;
}


@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient) { }

  getUsers(): Observable<IUser[]> {
    return this.http.get<IUser[]>(apiUrl);
  }

  getUser(id: number): Observable<IUser> {
    return this.http.get<IUser>(apiUrl + id);
  }

  getSomeUsers(ids: number[]): Observable<IUser[]> {
    return this.http.get<IUser[]>(apiUrl + "some?ids=" + ids);
  }

  getFriends(id: number): Observable<IUser[]> {
    return this.http.get<IUser[]>(apiUrl + id + '/friends');
  }

  addFriend(userId: number, friendId: number) {
    return this.http.post(apiUrl + userId + '/friends/' + friendId, null);
  }

  removeFriend(userId: number, friendId: number) {
    return this.http.delete(apiUrl + userId + '/friends/' + friendId);
  }

  blockUser(blockedId: number, userId: number) {
	return this.http.post(environment.BACKEND_URL_API + 'user/block', {blockedId: blockedId, userId: userId});
  }

  unblockUser(unblockedId: number, userId: number) {
	return this.http.post(environment.BACKEND_URL_API + 'user/unblock', {unblockedId: unblockedId, userId: userId});
  }

  // Utility method to automatically select between 42 avatar and uploaded image
  selectAvatarUrl(user: IUser) {
    if (user.avatarId) {
      return environment.BACKEND_URL_API + 'database-file/' + user.avatarId;
    } else {
      return user.avatar42Url;
    }
  }

  postName(id: number, name: string): Observable<UpdateNameDto> {
    const updateNameDto: UpdateNameDto = {name: name};
    return this.http.post<UpdateNameDto>(apiUrl + id + '/name', updateNameDto);
  }

  postAvatar(id: number, file: File): Observable<any> {
    if (file.size > 1_000_000) {
      alert("Avatar Upload failed\nThe File must not excede 1Mb!");
      return of(1);
    }
    const idxDot = file.name.lastIndexOf(".") + 1;
    const extFile = file.name.substring(idxDot, file.name.length).toLowerCase();
    if (extFile !== "jpg" && extFile != "jpeg" && extFile != "png") {
      alert("Avatar Upload failed\nOnly jpg/jpeg and png files are allowed!");
      return of(1);
    }
    const formData = new FormData();
    formData.append("file", file, file.name);
    return this.http.post(apiUrl + id + '/avatar', formData);
  }

  getLadderList(): Observable<IUser[]> {
    return this.http.get<IUser[]>(apiUrl + 'ladderList');
  }

  getRanking(userId: number, ladderList: IUser[]): number {
    let ranking: number[] = [];
    let i = 0;
    for (let ladder of ladderList) {
      if (i != 0 && ladder.win === ladderList[i - 1].win) {
        let l = ranking.length - 1;
        ranking.push(ranking[l]);
      }
      else {
        ranking.push(i + 1);
      }
      if (ladder.id === userId) {
        return ranking.pop() as number;
      }
      i++;
    }
    return 0;
  }

}

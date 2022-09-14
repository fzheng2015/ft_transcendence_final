import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Conversation, Message, User } from './chatbox.component';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ChatboxService {

  constructor(private http: HttpClient) {
  }

  sendMessage(message: string, convId: number, authorId: number) {
    return this.http.post<Message>(environment.BACKEND_URL_API + 'message/' + convId, {content: message, authorId: authorId});
  }

  getUserNameById(userId: number) {
	return this.http.get<string>(environment.BACKEND_URL_API + 'user/name/' + userId, {responseType: 'text' as 'json'});
  }

  createConversation(ownerId: number, otherIds: number[]) {
	return this.http.post<Conversation>(environment.BACKEND_URL_API + 'conversation', {ownerId: ownerId, otherIds: otherIds});
  }

  checkPassword(convId: number, password: string) {
	return this.http.post<boolean>(environment.BACKEND_URL_API + 'conversation/check/' + convId, {password: password});
  }

  addUserToConversation(convId: number, userId: number) {
	return this.http.post<Conversation>(environment.BACKEND_URL_API + 'conversation/' + convId, {userId: userId});
  }

  kickFromConversation(convId: number, userId: number) {
	return this.http.post<Conversation>(environment.BACKEND_URL_API + 'conversation/kick/' + convId, {userId: userId});
  }

  muteUserInConversation(convId: number, userId: number) {
	return this.http.post<Conversation>(environment.BACKEND_URL_API + 'conversation/mute/' + convId, {userId: userId});
  }

  unmuteUserInConversation(convId: number, userId: number) {
	return this.http.post<Conversation>(environment.BACKEND_URL_API + 'conversation/unmute/' + convId, {userId: userId});
  }

  makeUserAdmin(convId: number, userId: number) {
	return this.http.post<Conversation>(environment.BACKEND_URL_API + 'conversation/admin/' + convId, {userId: userId});
  }

  unmakeUserAdmin(convId: number, userId: number) {
	return this.http.post<Conversation>(environment.BACKEND_URL_API + 'conversation/unadmin/' + convId, {userId: userId});
  }

  changeConversationOwner(convId: number, userId: number) {
	return this.http.post<Conversation>(environment.BACKEND_URL_API + 'conversation/owner/' + convId, {userId: userId});
  }

  editScope(convId: number, scope: string, password: string = '') {
	return this.http.post<Conversation>(environment.BACKEND_URL_API + 'conversation/scope/' + convId, {scope: scope, password: password});
  }

  getOpenConversations(): Observable<Conversation[]> {
	return this.http.get<Conversation[]>(environment.BACKEND_URL_API + 'conversation/open');
  }

  getVisibleConversation(): Observable<Conversation[]> {
	return this.http.get<Conversation[]>(environment.BACKEND_URL_API + 'conversation/visible');
  }

  deleteConversation(convId: number): Observable<Conversation> {
	return this.http.delete<Conversation>(environment.BACKEND_URL_API + 'conversation/' + convId);
  }

}

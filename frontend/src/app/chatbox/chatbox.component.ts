import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { FormBuilder } from '@angular/forms';

import { ChatboxService } from './chatbox.service';
import { AuthService } from '../auth/auth.service';
import { UserService } from '../user/user.service';
import { SocketChat } from './chat.socket';
import { GameService } from '../game/game.service';
import { NotificationService } from '../notification/notification.service';
import { Router } from '@angular/router'

export interface User {
	id: number;
	name: string;
}

export interface Message {
  id: number;
  content: string;
  authorId: number;
  messageType: string;
  inviteId: string;
  inviteState: string;
}

export interface Conversation {
	id: number;
	name: string;
	scope: string;
	messages: Message[];
	ownerId: number;
	users: User[];
	userRegister: number[];
	mutedUsers: number[];
	admins: number[];
}

@Component({
	selector: 'app-chatbox',
	templateUrl: './chatbox.component.html',
	styleUrls: ['./chatbox.component.css'],
})
export class ChatboxComponent implements OnInit {

	conversations: Conversation[] = [];
	selectedConversationId: number = 0;
	selectedConversation: Conversation | undefined;
	visibleConversations: Conversation[] = [];
	userList: User[] = [];
	globalUserList: User[] = [];

	messageControl = new FormControl();
	scopeControl = new FormControl();
	passwordControl = new FormControl();

	action: string = "";
	userListOpen: boolean = false;
	scopeListOpen: boolean = false;

	userIsAdmin: boolean = false;
	userIsOwner: boolean = false;
	passwordPrompt: boolean = false;
	//all this should be moved elsewhere
	blockListOpen = false;
	inviteListOpen = false
	gameInvitePrompt: boolean = false;
	inviteCheckboxFormGroup: FormGroup;

	constructor(
		private chatboxService: ChatboxService,
		private authService: AuthService,
		private userService: UserService,
		private gameService: GameService,
		private socket: SocketChat,
		private formBuilder: FormBuilder,
		private notificationService: NotificationService,
		private router: Router
	) { }

	ngOnInit(): void {
		this.authService.logChange.subscribe((logChange) => {
            if (logChange.previous != -1 && logChange.next != logChange.previous) {
                this.socket.disconnect();
            }
            if (logChange.next != -1) {
                this.socket.connect();
            }
        })
		this.getOpenConversations();
		this.socket.on('update', () => this.getOpenConversations());
	}

	idcomp(a: Message, b: Message): number {
		if (a.id < b.id) { return 1; }
		if (a.id > b.id) { return -1; }
		return 0;
	}

	changeSelectedConversation(convId: number) {
		this.userListOpen = false;
		this.selectedConversationId = convId;
		this.selectedConversation = this.conversations.find((conversation) => conversation.id == this.selectedConversationId);
		if (this.selectedConversation != undefined) {
			this.userIsOwner = this.selectedConversation.ownerId == this.authService.getId();
			this.userIsAdmin = this.selectedConversation.admins.includes(this.authService.getId());
		}
	}

	getOpenConversations(): void {
		this.chatboxService.getOpenConversations().subscribe(conversations => {
			this.conversations = conversations;
			if (!this.conversations.find((conversation) => this.selectedConversationId == conversation.id)) {
				if (this.conversations[0] === undefined) {
					this.selectedConversation = undefined;
				} else {
					this.changeSelectedConversation(this.conversations[0].id);
				}
			} else {
				this.changeSelectedConversation(this.selectedConversationId);
			}
			// if (this.userListOpen) {
				this.getUsersInConversation(this.selectedConversationId, this.action);
			// }
			this.getVisibleConversations();
		});
	}

	// visible conv = conv visible in the list of joinable conversations
	// don't call this one directly, use getOpenConversations()
	// it's because we need the open conversations to know what are the visible conversations
	getVisibleConversations(): void {
		let openConvIds: number[] = [];
		this.conversations.forEach(conv => openConvIds.push(conv.id));
		this.chatboxService.getVisibleConversation().subscribe(conversations => this.visibleConversations = conversations.filter(
			conv => !openConvIds.includes(conv.id)
		));
	}

	getBlockableUsers(): void {
		let blackList: number[];
		this.userService.getUser(this.authService.getId()).subscribe(user => {
			blackList = user.blackList;
		});
		this.userService.getUsers().subscribe(users => this.globalUserList = users.filter(
			user => !blackList.includes(user.id) && this.authService.getId() != user.id
		));
	}

	getUnblockableUsers(): void {
		let blackList: number[];
		this.userService.getUser(this.authService.getId()).subscribe(user => {
			blackList = user.blackList;
		});
		this.userService.getUsers().subscribe(users => this.globalUserList = users.filter(
			user => blackList.includes(user.id)
		));
	}

	getUsersInConversation(convId: number | undefined, mode: string): void {
		const conversation: Conversation | undefined = this.conversations.find(conv => conv.id == convId);
		if (conversation === undefined) {
			console.error('conversation not found. id: ' + convId);
			return;
		}
		if (mode == 'kick') {
			this.userService.getUsers().subscribe(users => this.userList = users.filter(
				user => conversation.userRegister.includes(user.id)
				&& user.id != this.authService.getId()
				&& !conversation.admins.includes(user.id)
				&& conversation.ownerId != user.id
			));
		}
		else if (mode == 'owner') {
			this.userService.getUsers().subscribe(users => this.userList = users.filter(
				user => conversation.userRegister.includes(user.id)
				&& user.id != this.authService.getId()
				&& conversation.ownerId != user.id
			));
		}
		else if (mode == 'mute') {
			this.userService.getUsers().subscribe(users => this.userList = users.filter(
				user => conversation.userRegister.includes(user.id)
				&& user.id != this.authService.getId()
				&& !conversation.admins.includes(user.id)
				&& conversation.ownerId != user.id
				&& !conversation.mutedUsers.includes(user.id)
			));
		}
		else if (mode == 'unmute') {
			this.userService.getUsers().subscribe(users => this.userList = users.filter(
				user => conversation.userRegister.includes(user.id)
				&& user.id != this.authService.getId()
				&& !conversation.admins.includes(user.id)
				&& conversation.ownerId != user.id
				&& conversation.mutedUsers.includes(user.id)
			));
		}
		else if (mode == 'invite') {
			this.userService.getUsers().subscribe(users => this.userList = users.filter(
				user => !conversation.userRegister.includes(user.id)
			));
		}
		else if (mode == 'admin') {
			this.userService.getUsers().subscribe(users => this.userList = users.filter(
				user => conversation.userRegister.includes(user.id)
				&& user.id != this.authService.getId()
				&& !conversation.admins.includes(user.id)
			));
		}
		else if (mode == 'unadmin') {
			this.userService.getUsers().subscribe(users => this.userList = users.filter(
				user => conversation.admins.includes(user.id)
			));
		}
	}

	submitMessage(convId: number) {
		let conv: Conversation | undefined = this.conversations.find(conversation => conversation.id == convId);
		if (conv == undefined || !conv.userRegister.includes(this.authService.getId())) {
			this.messageControl.reset();
			return;
		}
		if (!(conv.mutedUsers.includes(this.authService.getId()))) {
			if (this.messageControl.value == null) {
				return;
			}
			this.chatboxService.sendMessage(this.messageControl.value, convId, this.authService.getId()).subscribe(
				() => this.socket.emit('notify', convId)
			);
		}
		this.messageControl.reset();
	}

	openGameInvitePrompt() {
		this.gameInvitePrompt = !this.gameInvitePrompt;
	}

	createInviteToGame(convId: number, mode: string) {
		this.gameService.createInvite(convId, this.authService.getId(), mode);
		this.socket.emit('notify', convId);
	}

	joinGame(inviteId: string) {
		this.gameService.joinInvite(inviteId);
	}

	userListControl: {[id: number]: boolean} = {};

	getUserNameById(userId: string): string {
		let ret = this.userList.find(user => user.id == userId as unknown as number)?.name;
		if (ret === undefined)
			return "";
		return ret;
	}

	getUserNameByIdInConv(userId: number, convId: number): string {
		let ret = this.conversations.find(conv => conv.id == convId)?.users.find(user => user.id == userId)?.name;
		if (ret === undefined)
			return "";
		return ret;
	}

	openInviteList() {
		this.userListControl = {};
		this.userService.getUsers().subscribe(users => {
			this.userList = users.filter(user => user.id != this.authService.getId());
			this.userList.forEach(user => this.userListControl[user.id] = false);
			this.inviteCheckboxFormGroup = this.formBuilder.group(this.userListControl);
			this.inviteListOpen = !this.inviteListOpen;
		});
	}

	// need this bc in js ([1] === [1]) : false for some reason
	arrayCompare(a: number[], b: number[]): boolean {
		if (a.length != b.length) {
			return false;
		}
		for (let val of a) {
			if (!b.includes(val)) {
				return false;
			}
		}
		return true;
	}

	startConversation() {
		this.inviteListOpen = false;
		let otherIds: number[] = [];
		for (let id in this.inviteCheckboxFormGroup.value) {
			if (this.inviteCheckboxFormGroup.value[id]) {
				otherIds.push(Number(id));
			}
		}
		if (otherIds.length == 0) {
			return;
		}
		otherIds.push(this.authService.getId());
		for (let conv of this.conversations) {
			if (this.arrayCompare(conv.userRegister, otherIds)) {
				this.changeSelectedConversation(conv.id);
				return;
			}
		}
		otherIds.pop();
		this.chatboxService.createConversation(this.authService.getId(), otherIds).subscribe(
			newconv => this.socket.emit('notify', newconv.id)
		);
	}

	inviteToConversation(convId: number, userId: number) {
		this.chatboxService.addUserToConversation(convId, userId).subscribe(
			() => {
				this.socket.emit('notify', convId);
			}
		);
	}

	joinConversation(convId: number, convScope: string) {
		if (convScope == 'protected') {
			let pswd: string;
			if (this.passwordControl.value == null) {
				pswd = '';
			} else {
				pswd = this.passwordControl.value;
			}
			this.chatboxService.checkPassword(convId, pswd).subscribe(
				passwordMatch => {
					if (passwordMatch) {
						this.chatboxService.addUserToConversation(convId, this.authService.getId()).subscribe(
							() => this.socket.emit('notify', convId)
						);
					} else {
						this.notificationService.notify('incorrect password', '', '', 1000);
					}
				}
			);
			this.passwordControl.reset();
		}
		else {
			this.chatboxService.addUserToConversation(convId, this.authService.getId()).subscribe(
				() => this.socket.emit('notify', convId)
			);
		}
	}

	kickFromConversation(convId: number, userId: number) {
		this.chatboxService.kickFromConversation(convId, userId).subscribe(
			() => {
				this.socket.emit('notify', convId);
			}
		);
	}

	leaveConversation(convId: number) {
		const conversation: Conversation | undefined = this.conversations.find(conv => conv.id == convId);
		this.userListOpen = false;
		if (conversation === undefined) {
			console.error('conversation not found. id: ' + convId);
			return;
		}
		if (this.authService.getId() == conversation.ownerId) {
			this.notificationService.notify("You can't leave this conversation since you are the owner. DELETE it instead.", '', '', 2000);
			return;
		}
		else {
			if (this.userIsAdmin) {
				this.unmakeUserAdmin(convId, this.authService.getId());
			}
			this.chatboxService.kickFromConversation(convId, this.authService.getId()).subscribe(
				() => this.socket.emit('notify', convId)
			);
		}
	}

	muteUserInConversation(convId: number, userId: number) {
		this.chatboxService.muteUserInConversation(convId, userId).subscribe(
			() => {
				this.socket.emit('notify', convId);
			}
		);
	}
	
	unmuteUserInConversation(convId: number, userId: number) {
		this.chatboxService.unmuteUserInConversation(convId, userId).subscribe(
			() => {
				this.socket.emit('notify', convId);
			}
		);
	}

	makeUserAdmin(convId: number, userId: number) {
		this.chatboxService.makeUserAdmin(convId, userId).subscribe(
			() => {
				this.socket.emit('notify', convId);
			}
		);
	}

	unmakeUserAdmin(convId: number, userId: number) {
		this.chatboxService.unmakeUserAdmin(convId, userId).subscribe(
			() => {
				this.socket.emit('notify', convId);
			}
		);
	}

	changeConversationOwner(convId: number, userId: number) {
		this.userListOpen = false;
		this.chatboxService.changeConversationOwner(convId, userId).subscribe(
			() => {
				this.socket.emit('notify', convId);
			}
		);
	}

	openPasswordPrompt() {
		this.passwordPrompt = !this.passwordPrompt;
	}

	editScope(convId: number, mode: string) {
		if (mode == 'protected') {
			if (this.passwordControl.value.length >= 256) {
				this.notificationService.notify('Password is too long, max 256 characters.', '', '', 1000);
				return;
			}
			this.chatboxService.editScope(convId, mode, this.passwordControl.value).subscribe(
				() => this.socket.emit('notify', convId)
			);
			this.passwordControl.reset();
		}
		else {
			this.chatboxService.editScope(convId, mode).subscribe(
				() => this.socket.emit('notify', convId)
			);
		}
		this.scopeListOpen = false;
		this.passwordPrompt = false;
	}

	deleteConversation(convId: number): void {
		this.userListOpen = false;
		this.chatboxService.deleteConversation(convId).subscribe(
			() => {
				this.socket.emit('notify', convId);
				this.getOpenConversations();
			}
		);
	}

	openUserList(convId: number, mode: string) {
		if (mode == this.action) {
			this.userListOpen = !this.userListOpen;
		} else {
			this.action = mode;
			this.getUsersInConversation(convId, mode);
			this.userListOpen = true;
		}
	}

	openScopeList() {
		this.scopeListOpen = !this.scopeListOpen;
	}

	openBlockList(mode: string) {
		if (mode == this.action) {
			this.blockListOpen = !this.blockListOpen;
		} else {
			this.blockListOpen = true;
		}
		this.action = mode;
		if (mode == 'block') {
			this.getBlockableUsers();
		} else if (mode == 'unblock') {
			this.getUnblockableUsers();
		}
	}

	blockUser(userId: number) {
		this.userService.blockUser(userId, this.authService.getId()).subscribe(
			() => {
				this.getOpenConversations();
				this.getBlockableUsers();
			}
		);
		this.blockListOpen = false;
	}

	unblockUser(userId: number) {
		this.userService.unblockUser(userId, this.authService.getId()).subscribe(
			() => {
				this.getOpenConversations();
				this.getUnblockableUsers();
			}
		);
		this.blockListOpen = false;
	}

	goToProfile(userId: number) {
		this.router.navigate(['/user/' + userId]);
	}
}

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.css']
})
export class ToolbarComponent implements OnInit {

  constructor(
    private router: Router,
    private auth: AuthService,
    ) { }

  ngOnInit(): void {
  }

  // Routes towards profile
  onProfileClick() {
    this.router.navigate(['/user/' + this.auth.getId()]);
  }

  // Routes to user list
  onUsersClick() {
    this.router.navigate(['/user/list']);
  }

  onChatClick() {
    this.router.navigate(['/chatbox']);
  }

  onGameClick() {
    this.router.navigate(['/lobby']);
  }

  onLogoutClick() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  isLoggedIn() {
    return this.auth.isLoggedIn();
  }

}

import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-login-register',
  templateUrl: './login-register.component.html',
  styleUrls: ['./login-register.component.css']
})
export class LoginRegisterComponent implements OnInit {

  backend_url: string;

  constructor() {
    this.backend_url = environment.BACKEND_URL_API + 'auth/42';
  }

  ngOnInit(): void {
  }
}

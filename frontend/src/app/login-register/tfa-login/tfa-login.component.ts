import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/auth/auth.service';
import {Router, ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-tfa-login',
  templateUrl: './tfa-login.component.html',
  styleUrls: ['./tfa-login.component.css']
})
export class TfaLoginComponent implements OnInit {

  constructor(
    private authService: AuthService,
    private router: Router,
    private matDialog: MatDialog,
    private route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
	const routeParams = this.route.snapshot.paramMap;
    const userId = Number(routeParams.get('id'));
    this.authService.checkUser(userId).subscribe((res) => {
      if (res === false) {
        alert('You are not supposed to be here!');
        this.router.navigate(['/login']);
      }
    })
  }

  tfaCode: string;
  submitTfaCode() {

    if (!this.tfaCode) {
      alert('Please enter the Tfa Code');
      return ;
    }
    const routeParams = this.route.snapshot.paramMap;
    const userId = Number(routeParams.get('id'));

    this.authService.loginTfaCheck(this.tfaCode).subscribe({
      next: (validTfaCode: any) => {
        this.tfaCode = '';
        this.authService.login(userId);
        this.router.navigate(['/user/' + userId]);
      },
      error: (error: any) => {
        alert('Wrong Tfa Code');
        this.tfaCode = '';
        return;
      }});
  }

}

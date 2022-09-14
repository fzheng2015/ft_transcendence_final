import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/auth/auth.service';


// A component without a template designed to finalize the login process on success
@Component({
  selector: 'app-login-success',
  template: '',
  styles: ['']
})
export class LoginSuccessComponent implements OnInit {

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
    ) { }

  ngOnInit(): void {
    const routeParams = this.route.snapshot.paramMap;
    const userId = Number(routeParams.get('id'));
    if (this.authService.checkUser(userId).subscribe(userChecksOut => {return userChecksOut;})) {
      this.authService.login(userId);
      this.router.navigate(['/user/' + userId + '/edit']);
    } else {
      this.router.navigate(['/login']);
    }
  }

}

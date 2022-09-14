import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import { IUser } from '../user.interface';
import { UserService } from '../user.service';
import { delay } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { TfaQrCodeComponent } from 'src/app/login-register/tfa-login/tfa-qr-code.component';
import { TfaCheckComponent } from 'src/app/login-register/tfa-login/tfa-check.component';

@Component({
  selector: 'app-user-profile-edit',
  templateUrl: './user-profile-edit.component.html',
  styleUrls: ['./user-profile-edit.component.css']
})
export class UserProfileEditComponent implements OnInit {

  userId: number = 0;
  user: IUser = {} as IUser;

  name = new FormControl('');
  fileName: string = "";
  avatarFile: File | null = null;

  constructor(
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute,
    private auth: AuthService,
    private matDialog: MatDialog,
  ) { }

  isTfaChecked: boolean;

  ngOnInit(): void {
    const routeParams = this.route.snapshot.paramMap;
    this.userId = Number(routeParams.get('id'));
    console.log(this.userId);
    this.userService.getUser(this.userId).subscribe((user) => this.user = user);
    this.auth.getTfaStatus().subscribe((value) => {
      this.isTfaChecked = value.isTfaEnabled;
    });
  }

  onSave() {
    if (this.name.value) {
      this.userService.postName(this.userId, this.name.value).subscribe();
    }
    if (this.avatarFile) {
      this.userService.postAvatar(this.userId, this.avatarFile).subscribe();
    }
    setTimeout(() => {
      this.router.navigate(['/user/' + this.userId]);
    }, 200)
  }

  onCancel() {
    this.router.navigate(['/user/' + this.userId]);
  }

  onNewAvatarSelected(files: FileList | null) {
    if (files) {
      this.avatarFile = files.item(0);
    }
  }

  switchTfa() {
    if (!this.isTfaChecked) {
      this.auth.switchOffTfa().subscribe();
    }
    else {
      this.auth.getTfaStatus().subscribe((data: { isTfaInitialized: boolean; }) => {
        if (data.isTfaInitialized) {
          this.isTfaChecked = false;
          let after;
          after = this.matDialog.open(TfaCheckComponent);
          after.afterClosed().subscribe(
            (res: { tfaStatus: boolean; }) => {
              if (res) { this.isTfaChecked = res.tfaStatus }
            });
        }
        else {
          this.openDialog();
        }
      });
    }
  }

  openDialog() {
    let afterClose = this.matDialog.open(TfaQrCodeComponent);
    afterClose.afterClosed().subscribe(
      (res: { tfaStatus: boolean; }) => {
        if (res) {
          this.isTfaChecked = res.tfaStatus
        }
        else {
          this.isTfaChecked = false;
        }
      }
    );
  }

  rmQrCode() {
    this.auth.rmTfaSecret().subscribe();
    alert('The TFA Code has been removed');
  }
}

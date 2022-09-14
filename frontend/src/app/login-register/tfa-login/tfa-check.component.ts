import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/auth/auth.service';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-tfa-check',
  templateUrl: './tfa-check.component.html',
  styleUrls: ['./tfa-check.component.css']
})
export class TfaCheckComponent implements OnInit {

  constructor(
    private authService: AuthService,
    private matDialogRef: MatDialogRef<TfaCheckComponent>,
  ) { }

  ngOnInit(): void {
  }

  tfaCode: string;

  submitTfaCheck(){

    if (!this.tfaCode) {
      alert('Please enter the Tfa Code');
      this.matDialogRef.close({tfaStatus: false});
      return;
    }

    this.authService.isTfaCodeValid(this.tfaCode).subscribe({
      next: (validTfaCode: any) => {
        if (validTfaCode.isValid == true) {
          alert('Tfa is On');
          this.authService.switchOnTfa().subscribe();
          this.matDialogRef.close({ tfaStatus: true });
        }
        else {
          alert('Wrong Tfa Code, TFA Off');
          this.authService.switchOffTfa().subscribe();
          this.matDialogRef.close({ tfaStatus: false });
        }
      },
      error: (error: any) => {
          this.matDialogRef.close({ tfaStatus: false });
      }
    });
    this.tfaCode = '';
  }

}

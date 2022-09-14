import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-tfa-qr-code',
  templateUrl: './tfa-qr-code.component.html',
  styleUrls: ['./tfa-qr-code.component.css']
})
export class TfaQrCodeComponent implements OnInit {

  constructor(
    private matDialogRef: MatDialogRef<TfaQrCodeComponent>,
    private authService: AuthService,
  ) { }

  ngOnInit(): void {
    this.displayQrCode();
  }

  imgToShow: any;
  tfaCode: string;

  createImg(image: Blob) {
    let reader = new FileReader();
    reader.addEventListener("load", () => {
      this.imgToShow = reader.result;
    }, false);
    if (image){
      reader.readAsDataURL(image);
    }
  }

  isImgLoading: boolean;
  displayQrCode() {
    this.isImgLoading = true;
    this.authService.getGenTfa().subscribe({
      next: (data: any) => {
        this.createImg(data);
        this.isImgLoading = false;
      },
      error: (error: any) => {
        this.isImgLoading = false
      }
    });
  }

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

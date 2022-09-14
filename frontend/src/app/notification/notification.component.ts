import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { NotificationService } from './notification.service';
import { Notification } from './notification.interface';


// Notification component imported at the very root of the app
// Allows to display notification with optional actions
// Only one notification at a time can be displayed
// Import and use notificationService.notify() to display a notification

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css']
})
export class NotificationComponent implements OnInit {

  onNotifySub: Subscription;
  onActionSub: Subscription;

  constructor(
    private notificationService: NotificationService,
    private snackBar: MatSnackBar,
    private router: Router
    ) {
      this.onNotifySub = notificationService.notifyChange.subscribe((notification: Notification) => {
        this.notifyAndWaitForAction(notification.message, notification.actionName, notification.route, notification.duration);
      });
    }

  ngOnInit(): void {
  }

  notifyAndWaitForAction(message: string, actionName: string, route: string, duration: number = 2000) {
    const snackBarRef = this.snackBar.open(message, actionName, {
      duration: duration,
      verticalPosition: 'top'
    });
    if (actionName !== '' && route !== '') {
      if (this.onActionSub) { this.onActionSub.unsubscribe(); }
      this.onActionSub = snackBarRef.onAction().subscribe(() => this.router.navigate([route]));
    }
  }

  ngOnDestroy() {
    this.onNotifySub.unsubscribe();
    this.onActionSub.unsubscribe();
  }
}

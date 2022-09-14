import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Notification } from './notification.interface'

// Notify service can be used to display a notification
// The service generates a stream of observables used by the component
// When you call the service, it emits an observable which is subscribed by
// the Notification component.


@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  notification: Notification;
  notifyChange: Subject<Notification> = new Subject<Notification>();

  constructor() { }

  // Call this method to display a notification
  // If actionName and route are empty string, no actions will be displayed
  notify(
    message: string,
    actionName: string = '',
    route: string = '',
    duration: number = 1000)
  {
    this.notification = {message: message, actionName: actionName, route: route, duration: duration};
    this.notifyChange.next(this.notification);
  }

}

import { Injectable } from "@angular/core";
import { Socket } from "ngx-socket-io";
import { environment } from "src/environments/environment";
import { AuthService } from "../auth/auth.service";

@Injectable()
export class SocketChat extends Socket {

  constructor(
    private authService: AuthService
  ) {
    super({ url: environment.BACKEND_URL + 'chat', options: {withCredentials: true, transports: ['websocket']} });
  }
}
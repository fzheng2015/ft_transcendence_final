import { CanActivate, ExecutionContext, Injectable, Inject, forwardRef } from '@nestjs/common';
import { Observable } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';

@Injectable()
export class UserIsSelfGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private configService: ConfigService
  ) { }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const req = context.switchToHttp().getRequest();
    return this.authService.check(Number(req.params.id), String(req.cookies.Authentication));
  }
}

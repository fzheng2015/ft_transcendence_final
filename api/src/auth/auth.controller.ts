import { Controller, Get, Post, Param, Req, Res, UseGuards, ParseIntPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { UserService } from 'src/user/user.service';
import { AuthService } from './auth.service';
import JwtAuthGuard from './jwt-auth.guard';
import RefreshGuard from './jwt-refresh.guard';
import ReqWithUser from './reqWithUser.interface';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private configService: ConfigService,
  ) { }

  // Call this to initiate the 42 auth flow
  @Get('42')
  @UseGuards(AuthGuard('42')) // This is used to automatically manage the auth flow
  async get42User(@Req() req, @Res({ passthrough: true }) res: Response) { }

  // This is the 42 oauth2 redirect endpoint
  @Get('42/redirect')
  @UseGuards(AuthGuard('42')) // This is used to automatically manage the auth flow
  async redirect(@Req() req, @Res() res) {
    // here we can use req.user to access what we filled in the validate function
    // we need the user_id to redirect to it's login page, as well as its jwt and if the user is new or not !
    res.setHeader('Set-Cookie', [req.user.jwt, req.user.jwtRefresh]);
    if (req.user.isTfaEnabled){
      const url = this.configService.get('FRONTEND_URL') + 'tfaLogin/' + req.user.id;
      res.redirect(url);
      return ;
    }
    const url = this.configService.get('FRONTEND_URL') + 'login/success/' + req.user.id;
    res.redirect(url);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logOut(@Req() req: ReqWithUser, @Res() res: Response) {
    res.setHeader('Set-Cookie', this.authService.getCookieToLogOut());
    return res.sendStatus(200);
  }

  @UseGuards(RefreshGuard)
  @Get('refresh')
  refresh(@Req() req: ReqWithUser, @Res() res: Response) {
    const accessToken = this.authService.getCookieWithJwtAccess(req.user.id);
    res.setHeader('Set-Cookie', accessToken);
    return res.sendStatus(200);
  }

  @Get('check/:id')
  async checkUser(@Req() req, @Res() res: Response, @Param('id', ParseIntPipe) id: number) {
    if (req.cookies.Authentication && this.authService.check(id, req.cookies.Authentication)) {
      return res.sendStatus(200);
    } else {
      return res.sendStatus(401);
    }
  }

  @Get('fake/:id')
  async fakeAuth(@Req() req, @Res() res, @Param('id', ParseIntPipe) id: number) {
    const jwt = this.authService.getCookieWithJwtAccess(id);
    const jwtRefresh = this.authService.getCookieWithJwtRefresh(id);
    res.setHeader('Set-Cookie', [jwt, jwtRefresh]);
    const url = this.configService.get('FRONTEND_URL') + 'login/success/' + id;
    res.redirect(url);
  }
}
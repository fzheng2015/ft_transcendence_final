import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from 'src/user/dtos/create_user.dto';
import { UserService } from 'src/user/user.service';
import { IValidatedUser } from './interfaces/validated-user.interface';
import TokenPayload from './interfaces/tokenPayload.interface';

@Injectable()
export class AuthService {

  constructor(
    private jwtService: JwtService,
    private userService: UserService,
    private configService: ConfigService,
  ) { }

  async validateLogin(userInfo): Promise<IValidatedUser> {
    // 1. Checks if the user exists and create it if it doesn't
    let userExists = true;
    let user = await this.userService.findOneBy42Username(userInfo.username42);
    if (!user) {
      userExists = false;
      const userDTO: CreateUserDto = {
        name: userInfo.username42,
        blackList: [],
        username42: userInfo.username42,
        friends: [],
        avatar42Url: userInfo.avatar42Url,
        email: userInfo.email
      }
      user = await this.userService.create(userDTO);
    }

    // 2. Generate jwt cookies
    const cookie = this.getCookieWithJwtAccess(user.id);
    const refreshCookie = this.getCookieWithJwtRefresh(user.id);

    const validatedUser: IValidatedUser = {
      id: user.id,
      userExists: userExists,
      jwt: cookie,
      jwtRefresh: refreshCookie,
      isTfaEnabled: user.isTfaEnabled
    }
    return validatedUser;
  }

  getCookieWithJwtAccess(userId: number, isTfa = false) {
    const payload: TokenPayload = { userId: userId, isTfa: isTfa };
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_ACCESS_SECRET'),
      expiresIn: `${this.configService.get('JWT_ACCESS_EXPI_TIME')}`
    });
    return `Authentication=${token}; HttpOnly; path=/; Max-Age=${this.configService.get('JWT_ACCESS_EXPI_TIME')}`;
  }

  getCookieWithJwtRefresh(userId: number) {
    const payload: TokenPayload = { userId: userId };
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: `${this.configService.get('JWT_REFRESH_EXPI_TIME')}`
    });
    return `Refresh=${token}; HttpOnly; path=/; Max-Age=${this.configService.get('JWT_REFRESH_EXPI_TIME')}`;
  }

  public getCookieToLogOut() {
    return [
      `Authentication=; HttpOnly; Path=/; Max-Age=0`,
      `Refresh=; HttpOnly; Path=/; Max-Age=0`
    ];
  }

  check(id: number, token: string): boolean {
    const decoded = this.jwtService.verify(token, this.configService.get('JWT_ACCESS_SECRET'));
    return decoded.userId == id;
  }

  verify(token: string) {
    return this.jwtService.verify(token, this.configService.get('JWT_ACCESS_SECRET'));
  }
}

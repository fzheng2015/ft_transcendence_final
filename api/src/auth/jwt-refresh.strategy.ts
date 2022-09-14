import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Request } from "express";
import { ExtractJwt, Strategy } from "passport-jwt";
import { UserService } from "src/user/user.service";
import TokenPayload from "./interfaces/tokenPayload.interface";

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwtRefresh') {
    constructor(
        private readonly userService: UserService,
        private readonly configService: ConfigService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([(req: Request) => {
                return req?.cookies?.Refresh;
            }]),
            secretOrKey: configService.get('JWT_REFRESH_SECRET')
        });
    }

    async validate(payload: TokenPayload) {
        return await this.userService.findOne(payload.userId);
    }
}
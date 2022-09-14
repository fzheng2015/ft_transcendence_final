import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";

import { Request } from "express";
import { ExtractJwt, Strategy } from "passport-jwt";
import { UserService } from "src/user/user.service";
import TokenPayload from "./interfaces/tokenPayload.interface";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private readonly userService: UserService,
        private readonly configService: ConfigService
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([(request: Request) => {
                return request?.cookies?.Authentication;
            }]),
            secretOrKey: configService.get('JWT_ACCESS_SECRET'),
        });
    }

    async validate(payload: TokenPayload) {
        return this.userService.findOne(payload.userId);
    }
}
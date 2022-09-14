import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, Profile } from "passport-42"
import { AuthService } from "./auth.service";

const k_redirectURL = process.env.BACKEND_URL_API + 'auth/42/redirect/'; // Change this if redirect route changes !!
const k_clientID = process.env.API42_CLIENT;
const k_clientSecret = process.env.API42_SECRET;

@Injectable()
export class FortyTwoStrategy extends PassportStrategy(Strategy, '42') {
    // Here we configure the strategy implemented in passport-42
    constructor(
        private authService: AuthService
    ) {
        super({
            clientID: k_clientID,
            clientSecret: k_clientSecret,
            callbackURL: k_redirectURL,
            scope: ['public'],
            passReqToCallback: true,
            // Configure here what you need from the profile: https://www.passportjs.org/packages/passport-42/
            profileFields: {
                'id': function (obj) { return String(obj.id); },
                'username': 'login',
                'profileUrl': 'url',
                'avatarUrl': 'image_url',
                'email': 'email'
            }
        }
        )
    }

    async validate(request: Request, accessToken: string, refreshToken: string, profile: Profile, done: Function) {
        const userInfo = {
            username42: profile.username,
            avatar42Url: profile.avatarUrl,
            email: profile.email,
        }
        try {
            // This adds the user if it doesn't exist and generate a jwt for backend authorization
            const validatedUser = await this.authService.validateLogin(userInfo);
            return done(null, validatedUser);
        } catch (err) {
            return done(err);
        }
    }
}

import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-naver-v2';

@Injectable()
export class JwtNaverStrategy extends PassportStrategy(Strategy, 'naver') {
    constructor() {
        super({
            clientID: process.env.OAUTH_NAVER_ID,
            clientSecret: process.env.OAUTH_NAVER_SECRET,
            callbackURL: process.env.OAUTH_NAVER_CALLBACK,
            scope: ['email', 'profile'],
        })
    }

    validate(accessToken: string, refreshToken: string, profile: Profile, done: any) {
        return {
            email: !profile.email ? 'defaultEmail' : profile.email,
            password: 'qwer12345',
            name: !profile.name ? 'default' : profile.name,
            phone: !profile.mobile ? '010-0000-0000' : profile.mobile,
        }
    }
}
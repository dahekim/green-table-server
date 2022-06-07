import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-kakao";

@Injectable()
export class JwtKakaoStrategy extends PassportStrategy(Strategy, "kakao") {
    constructor() {
        super({
            clientID: process.env.OAUTH_KAKAO_ID,
            clientSecret: process.env.OAUTH_KAKAO_SECRET,
            callbackURL: process.env.OAUTH_KAKAO_CALLBACK,
            scope: ['account_email', 'profile_nickname'],
        })
    }


    validate(accessToken: string, refreshToken: string, profile: any) {
        return {
            email: !profile._json.kakao_account.email
                ? "muzi@kakao.com"
                : profile._json.kakao_account.email,
            password: "qwer1234",
            name: !profile.displayName ? "홍길동" : profile.displayName,
            phone: !profile.mobile ? "010-5678-1234" : profile.mobile,
        }
    }
}


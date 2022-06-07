import { Cache } from 'cache-manager'
import { CACHE_MANAGER, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtAccessStrategy extends PassportStrategy(Strategy, "access") {
    constructor(
        @Inject(CACHE_MANAGER)
        private readonly cacheManager: Cache,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: process.env.ACCESS_TOKEN,
            passReqToCallback: true,
        })
    }

    async validate(req, payload) {
        const accessToken = req.headers.authorization.split(" ")[1]
        let isExpired = await this.cacheManager.get(
            `accessToken : ${accessToken}`
            )
        if (isExpired) {
            throw new UnauthorizedException("이미 로그아웃한 사용자입니다.")
        }
        return {
            user_id: payload.sub,
            email: payload.email,
        }
    }
}

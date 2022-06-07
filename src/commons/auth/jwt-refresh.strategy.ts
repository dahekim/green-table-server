import { Cache } from 'cache-manager'
import { CACHE_MANAGER, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'refresh') {
    constructor(
        @Inject(CACHE_MANAGER)
        private readonly cacheManager: Cache,
    ) {
    super({
        jwtFromRequest: (req) =>
        req.headers.cookie
        .split('; ')
        .filter((el) => el.includes('refreshToken='))[0]
        .replace('refreshToken=', ''),
        secretOrKey: process.env.REFRESH_TOKEN,
        passReqToCallback: true,
    });
}

    async validate(req, payload) {
        const refreshToken = req.headers.cookie.replace('refreshToken=','')
        let isExist = await this.cacheManager.get(
            `refreshToken:${refreshToken}`
            )
        if(isExist){
            throw new UnauthorizedException("이미 로그아웃한 사용자입니다.")
        }
        return {
            user_id: payload.sub,
            email: payload.email,
        }
    }
}

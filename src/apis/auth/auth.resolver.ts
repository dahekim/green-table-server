import { Cache } from 'cache-manager'
import { UnprocessableEntityException, CACHE_MANAGER, Inject, UnauthorizedException, UseGuards } from '@nestjs/common'
import { Args, Context, Mutation, Resolver } from '@nestjs/graphql'
import { CurrentUser, ICurrentUser } from 'src/commons/auth/gql-user.param'
import { GqlAuthRefreshGuard, GqlAuthAccessGuard } from 'src/commons/auth/gql-auth.guard'
import * as bcrypt from 'bcrypt'
import * as jwt from 'jsonwebtoken'
import { AuthService } from './auth.service'
import { UserService } from '../user/user.service'



@Resolver()
export class AuthResolver {
    constructor(
        private readonly userService: UserService,
        private readonly authService: AuthService,

        @Inject(CACHE_MANAGER)
        private readonly cacheManager: Cache,
    ) { }

    @Mutation(() => String)
    async login(
        @Args('email') email: string,
        @Args('password') password: string,
        @Context() context: any,
    ) {
        const user = await this.userService.findOne({ email })
        if (!user) throw new UnprocessableEntityException("존재하지 않는 이메일입니다.")

        const isAuth = await bcrypt.compare(password, user.password)
        if (!isAuth) throw new UnprocessableEntityException("비밀번호가 일치하지 않습니다.")
        this.authService.setRefreshToken({ user, res: context.res })
        return this.authService.getAccessToken({ user })
    }

    @UseGuards(GqlAuthAccessGuard)
    @Mutation(() => String)
    async logout(@Context() context: any) {
        const accessToken = await context.req.headers.authorization.split(" ")[1]
        const refreshToken = await context.req.headers.cookie.replace("refreshToken=", "")
        try {
            const myAccess = jwt.verify(accessToken, process.env.ACCESS_TOKEN)
            const myRefresh = jwt.verify(refreshToken, process.env.REFRESH_TOKEN)
            await this.cacheManager.set(
                `accessToken : ${accessToken}`,
                'accessToken',
                { ttl: myAccess['exp'] - myAccess['iat'] }
            )

            await this.cacheManager.set(
                `refreshToken : ${refreshToken}`,
                'refreshToken',
                { ttl: myRefresh['exp'] - myRefresh['iat'] }
            )

        } catch (error) {
            if (error?.response?.data?.message) throw new UnauthorizedException("❌ 토큰값이 일치하지 않습니다.")
            else throw new UnauthorizedException(error)
        }
        console.log("⭕️ 로그아웃 성공!")
        return "⭕️ 로그아웃 성공!"
    }

    @UseGuards(GqlAuthRefreshGuard)
    @Mutation(() => String)
    restoreAccessToken(@CurrentUser() currentUser: ICurrentUser) {
        return this.authService.getAccessToken({ user: currentUser })
    }
}
import { Module } from "@nestjs/common"
import { JwtModule } from "@nestjs/jwt"
import { TypeOrmModule } from "@nestjs/typeorm"

import { User } from "../user/entities/user.entity"
import { UserService } from "../user/user.service"
import { AuthResolver } from './auth.resolver'
import { AuthService } from './auth.service'
import { AuthController } from "./auth.controller"

import { JwtRefreshStrategy } from "src/commons/auth/jwt-refresh.strategy"
import { JwtGoogleStrategy } from 'src/commons/auth/jwt-social-google.strategy'
import { JwtNaverStrategy } from 'src/commons/auth/jwt-social-naver.strategy'
import { JwtKakaoStrategy } from 'src/commons/auth/jwt-social-kakao.strategy'


@Module({
    imports: [
        JwtModule.register({}),
        TypeOrmModule.forFeature([User])
    ],
    providers: [
        JwtKakaoStrategy,
        JwtNaverStrategy,
        JwtGoogleStrategy,
        JwtRefreshStrategy,
        AuthResolver,
        AuthService,
        UserService,
    ],
    controllers: [
        AuthController
    ],
})
export class AuthModule { }

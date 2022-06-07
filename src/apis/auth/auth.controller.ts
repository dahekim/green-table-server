import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { User } from '../user/entities/user.entity';
import { AuthService } from './auth.service';

interface IOAuthUser {
    user: Pick<User, 'email' | 'password' | 'name' | 'phone'>
}

@Controller("/")
export class AuthController {
    constructor(
        private readonly authService: AuthService,
    ) { }

    @Get('google')
    @UseGuards(AuthGuard('google'))
    async loginGoogle(
        @Req() req: Request & IOAuthUser,
        @Res() res: Response,
    ) {
        await this.authService.socialLogin({ req, res })
    }

    @Get('naver')
    @UseGuards(AuthGuard('naver'))
    async loginNaver(
        @Req() req: Request & IOAuthUser,
        @Res() res: Response
    ) {
        await this.authService.socialLogin({ req, res })
    }

    @Get('kakao')
    @UseGuards(AuthGuard('kakao'))
    async loginKakao(
        @Req() req: Request & IOAuthUser,
        @Res() res: Response
    ) {
        await this.authService.socialLogin({ req, res });
    }
}
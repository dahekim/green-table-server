import { Mutation, Resolver, Query, Args, Context } from "@nestjs/graphql"
import { User } from "./entities/user.entity"
import { UserService } from "./user.service"
import { UpdateUserInput } from "./dto/updateUser.input"
import * as bcrypt from 'bcrypt'
import * as jwt from 'jsonwebtoken'
import { CurrentUser, ICurrentUser } from "src/commons/auth/gql-user.param"
import { CACHE_MANAGER, Inject, UnauthorizedException, UseGuards } from "@nestjs/common"
import { GqlAuthAccessGuard } from "src/commons/auth/gql-auth.guard"
import { FileUpload, GraphQLUpload } from 'graphql-upload'
import { getToday } from 'src/commons/libraries/utils';
import { Cache } from 'cache-manager'


@Resolver()
export class UserResolver {
    constructor(
        private readonly userService: UserService,

        @Inject(CACHE_MANAGER)
        private readonly cacheManager: Cache,
    ) { }

    @UseGuards(GqlAuthAccessGuard)
    @Query(() => User)
    async fetchUser(
        @CurrentUser() currentUser: ICurrentUser,
    ) {
        const email = currentUser.email
        return await this.userService.findOne({ email })
    }

    @UseGuards(GqlAuthAccessGuard)
    @Query(() => [User])
    async fetchUsers() {
        return await this.userService.findAll()
    }

    @UseGuards(GqlAuthAccessGuard)
    @Query(() => [User])
    async fetchUsersWithDel() {
        return await this.userService.withDelete()
    }

    @Mutation(() => User)
    async createUser(
        @Args('email') email: string,
        @Args('password') password: string,
        @Args('name') name: string,
        @Args('phone') phone: string,
    ) {
        const hashedPassword = await bcrypt.hash(password, 10)
        return this.userService.create({ email, password: hashedPassword, name, phone })
    }

    @Mutation(() => String)
    async getToken(@Args('phone') phone: string,) {
        return await this.userService.sendTokenToSMS({ phone })
    }

    @Mutation(() => String)
    async checkValidToken(
        @Args('phone') phone: string,
        @Args('token') token: string,
    ) {
        return await this.userService.isMatch({ phone, token })
    }


    @UseGuards(GqlAuthAccessGuard)
    @Mutation(() => User)
    async updateUser(
        @Args('user_id') user_id: string,
        @Args('updateUserInput') updateUserInput: UpdateUserInput,
    ) {
        return this.userService.update({ user_id, updateUserInput })
    }

    @UseGuards(GqlAuthAccessGuard)
    @Mutation(() => User)
    async updatePassword(
        @Args('user_id') user_id: string,
        @Args('password') password: string,
    ) {
        const hashedPassword = await bcrypt.hash(password, 10)
        return this.userService.updatePassword({ user_id, hashedPassword })
    }

    @UseGuards(GqlAuthAccessGuard)
    @Mutation(()=> String)
    async uploadProfileImage(
        @Args({ name: 'file', type: () => GraphQLUpload }) 
        file: FileUpload,
    ){
        const fileName = `profile/${getToday()}/${file.filename}`
        return await this.userService.uploadImage({ file, fileName })
    }

    @UseGuards(GqlAuthAccessGuard)
    @Mutation(() => String)
    async deleteProfileImage(
        @Args('user_id') user_id: string, 
    ) {
        return await this.userService.deleteImage({ user_id })
    }

    @UseGuards(GqlAuthAccessGuard)
    @Mutation(()=> String)
    async uploadCertificationImage(
        @Args({ name: 'file', type: () => GraphQLUpload }) 
        file: FileUpload,
        
    ){
        const fileName = `certificationImage/${getToday()}/${file.filename}`
        return await this.userService.uploadImage({ file, fileName })
    }

    @UseGuards(GqlAuthAccessGuard)
    @Mutation(()=> Boolean)
    async deleteUser(
        @Args('user_id') user_id: string,
        @Context() context: any,
        
    ) {
        const result = this.userService.delete({ user_id })

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
        
        return result ? true: false
    }
}
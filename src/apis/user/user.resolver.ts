import { Mutation, Resolver, Query, Args } from "@nestjs/graphql"
import { User } from "./entities/user.entity"
import { UserService } from "./user.service"
import { UpdateUserInput } from "./dto/updateUser.input"
import * as bcrypt from 'bcrypt'
import { CurrentUser, ICurrentUser } from "src/commons/auth/gql-user.param"
import { UseGuards } from "@nestjs/common"
import { GqlAuthAccessGuard } from "src/commons/auth/gql-auth.guard"
import { FileUpload, GraphQLUpload } from 'graphql-upload'
import { getToday } from 'src/commons/libraries/utils';


@Resolver()
export class UserResolver {
    constructor(
        private readonly userService: UserService,
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
    ) {
        const result = this.userService.delete({ user_id })
        return result ? true: false
    }
}
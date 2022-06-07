import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { JwtAccessStrategy } from "src/commons/auth/jwt-access.strategy"
import { Recipes } from "../recipes/entities/recipes.entity";
import { RecipesReply } from "../recipiesReply/entities/recipes.reply.entity";
import { User } from "./entities/user.entity";
import { UserResolver } from "./user.resolver";
import { UserService } from "./user.service";

@Module({
    imports:[TypeOrmModule.forFeature([User, Recipes, RecipesReply])],
    providers:[UserResolver, UserService, JwtAccessStrategy,]
})
export class UserModule{}
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { JwtAccessStrategy } from "src/commons/auth/jwt-access.strategy";
import { Recipes } from "../recipes/entities/recipes.entity";
import { User } from "../user/entities/user.entity";
import { RecipesReply } from "./entities/recipes.reply.entity";
import { RecipesReplyResolver } from "./recipesReply.resolver";
import { RecipesReplyService } from "./recipesReply.service";

@Module({
    imports:[TypeOrmModule.forFeature([User, Recipes, RecipesReply])],
    providers:[RecipesReplyResolver, RecipesReplyService, JwtAccessStrategy,],
})
export class RecipesReplyModule{}
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { JwtAccessStrategy } from "src/commons/auth/jwt-access.strategy";
import { RecipeScrapHistory } from "../recipeScrap/entities/recipeScrap.entity";
import { RecipeScarpService } from "../recipeScrap/recipeScrap.service";
import { RecipesContentsImage } from "../recipesContentsImage/entities/recipesContentsImage.entity";
import {RecipesMainImage} from "../recipesMainImage/entities/recipesMainImage.entity"
import { RecipesIngredients } from "../recipesIngrediants/entities/recipesIngrediants.entity";
import { RecipesTag } from "../recipesTag/entities/recipesTag.entity";
import { RecipesReply } from "../recipiesReply/entities/recipes.reply.entity";
import { User } from "../user/entities/user.entity";
import { Recipes } from "./entities/recipes.entity";
import { RecipesResolver } from "./recipes.resolver";
import { RecipesService } from "./recipes.service";


@Module({
    imports: [
        TypeOrmModule.forFeature([
            User,
            Recipes,
            RecipesTag,
            RecipeScrapHistory,
            RecipesReply,
            RecipesMainImage,
            RecipesContentsImage,
            RecipesIngredients,
        ]),
    ],
    providers: [
        RecipesResolver,
        RecipesService,
        RecipeScarpService,
        JwtAccessStrategy
    ]
})
export class RecipesModule { }
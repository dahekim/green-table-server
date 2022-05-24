import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "../user/entities/user.entity";
import { UserService } from "../user/user.service";
import { CreateRecipesInput } from "./dto/createRecipes.input";
import { Recipes } from "./entities/recipes.entity";
import { RecipesResolver } from "./recipes.resolver";
import { RecipesService } from "./recipes.service";


@Module({
    imports: [
        TypeOrmModule.forFeature([
            User,
            Recipes,
        ]),
    ],
    providers: [
        RecipesResolver,
        RecipesService,
        UserService,
        CreateRecipesInput,
    ]
})
export class RecipesModule { }
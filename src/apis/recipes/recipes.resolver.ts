import { UseGuards } from "@nestjs/common";
import { Args, Int, Mutation, Query, Resolver } from "@nestjs/graphql";
import { FileUpload, GraphQLUpload } from "graphql-upload";
import { GqlAuthAccessGuard } from "src/commons/auth/gql-auth.guard";
import { CurrentUser, ICurrentUser } from "src/commons/auth/gql-user.param";
import { CreateRecipesInput } from "./dto/createRecipes.input";
import { UpdateRecipesInput } from "./dto/updateRecipes.input";
import { Recipes } from "./entities/recipes.entity";
import { RecipesService } from "./recipes.service";


@Resolver()
export class RecipesResolver {
    constructor(
        private readonly recipesService: RecipesService,
    ) { }

    @Query(() => [Recipes])
    async fetchRecipes(
        @Args({ name: 'page', nullable: true, type: () => Int,}) page?: number,
    ) {
        return await this.recipesService.fetchRecipesAll(page);
    }

    @Query(() => Int)
    async fetchRecipesCount(
        @Args({ name: 'page', nullable: true, type: () => Int,}) page?: number,
    ) {
        return await this.recipesService.fetchRecipesCount(page);
    }

    @Query(() => Recipes)
    async fetchRecipe(
        @Args('recipes_id') id: string,
    ) {
        return await this.recipesService.fetchRecipe({ id })
    }

    @Query(() => [Recipes])
    async fetchRecipeTypes(
        @Args('vegan_types') types: string,
        @Args({ name: 'page', nullable: true, type: () => Int,}) page?: number,
    ) {
        return await this.recipesService.fetchRecipeTypes({ types, page });
    }

    @Query(() => [Recipes])
    async fetchRecipeTypesPopular(
        @Args('vegan_types') types: string,
        @Args({ name: 'page', nullable: true, type: () => Int,}) page?: number,
    ) {
        return await this.recipesService.fetchRecipeTypesPopular({ types, page });
    }

    @UseGuards(GqlAuthAccessGuard)
    @Query(() => [Recipes])
    async fetchMyRecipe(
        @Args('user_id') user_id: string,
        @Args({ name: 'page', nullable: true, type: () => Int,}) page?: number,
    ) {
        return await this.recipesService.fetchMyRecipe({ user_id, page });
    }

    @Query(() => [Recipes])
    async fetchRecipeIsPro(
        @Args('isPro') isPro: string,
        @Args({ name: 'page', nullable: true, type: () => Int,}) page?: number,
    ) {
        return await this.recipesService.fetchRecipeIsPro({ isPro, page});
    }

    @Query(() => [Recipes])
    async fetchPopularRecipes(
        @Args({ name: 'page', nullable: true, type: () => Int,}) page?: number,
    ) {
        return await this.recipesService.fetchPopularRecipes(page);
    }

    @UseGuards(GqlAuthAccessGuard)
    @Mutation(() => Recipes)
    async createRecipe(
        @Args('createRecipesInput') createRecipesInput: CreateRecipesInput,
        @CurrentUser() currentUser: ICurrentUser
    ) {
        return await this.recipesService.create(
            { createRecipesInput },
            currentUser
        );
    }

    @UseGuards(GqlAuthAccessGuard)
    @Mutation(() => Recipes)
    async updateRecipe(
        @Args('recipe_id') id: string,
        @Args('updateRecipesInput') updateRecipesInput: UpdateRecipesInput,
    ) {
        return await this.recipesService.update({ id, updateRecipesInput });
    }

    @UseGuards(GqlAuthAccessGuard)
    @Mutation(() => Boolean)
    async deleteRecipe(
        @Args('recipe_id') id: string,
        @CurrentUser() currentUser: ICurrentUser
    ) {
        return await this.recipesService.delete({
            id,
            currentUser
        });
    }

    @UseGuards(GqlAuthAccessGuard)
    @Mutation(() => [String])
    uploadMainImages(
        @Args({ name: 'files', type: () => [GraphQLUpload] }) files: FileUpload[]
    ) {
        return this.recipesService.uploadMainImages({ files })
    }

    @UseGuards(GqlAuthAccessGuard)
    @Mutation(() => [String])
    uploadRecipeImages(
        @Args({ name: 'files', type: () => [GraphQLUpload] }) files: FileUpload[]
    ) {
        return this.recipesService.uploadDetailImages({ files })
    }

    @UseGuards(GqlAuthAccessGuard)
    @Mutation(() => [String])
    deleteRecipeImages(
        @Args('id') recipe_id: string,
    ) {
        return this.recipesService.deleteImage({ recipe_id })
    }


    @Query(() => [Recipes])
    searchRecipes(
        @Args('input') input: string,
        @Args({ name: 'page', nullable: true, type: () => Int, }) page?: number,
    ) {
        return this.recipesService.search({ input, page })
    }
}
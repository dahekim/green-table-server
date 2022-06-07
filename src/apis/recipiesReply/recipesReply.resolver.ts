import { UseGuards } from "@nestjs/common";
import { Args, Mutation, Resolver, Query, Int } from "@nestjs/graphql";
import { GqlAuthAccessGuard } from "src/commons/auth/gql-auth.guard";
import { CurrentUser, ICurrentUser } from "src/commons/auth/gql-user.param";
import { RecipesReply } from "./entities/recipes.reply.entity";
import { RecipesReplyService } from "./recipesReply.service";

@Resolver()
export class RecipesReplyResolver{
    constructor(
        private readonly recipesReplyService: RecipesReplyService,
    ){}

    @Query(()=>[RecipesReply])
    async fetchReplies(
        @Args('id') recipe_id: string,
        @Args({ name: 'page', nullable: true, type: () => Int,}) page?: number,
    ){
        return await this.recipesReplyService.findAll({recipe_id, page})
    }

    @UseGuards(GqlAuthAccessGuard)
    @Mutation(()=>String)
    async createReply(
        @CurrentUser() currentUser: ICurrentUser,
        @Args('contents') contents: string,
        @Args('id') recipe_id: string
    ){
        return await this.recipesReplyService.create({
            currentUser, contents, recipe_id
        })
    }

    @UseGuards(GqlAuthAccessGuard)
    @Mutation(()=>String)
    async updateReply(
        @Args('reply_id') reply_id: string,
        @Args('recipe_id') recipe_id: string, 
        @Args('contents') contents: string,
    ){
        return await this.recipesReplyService.update({ reply_id, recipe_id,  contents})
    }

    @UseGuards(GqlAuthAccessGuard)
    @Mutation(()=>String)
    async deleteReply(
        @CurrentUser() currentUser: ICurrentUser,
        @Args('reply_id') reply_id: string,
        @Args('recipe_id') recipe_id: string,
    ){
        return this.recipesReplyService.delete({currentUser, reply_id, recipe_id})
    }
}
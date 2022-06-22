import { Field, InputType, Int } from "@nestjs/graphql";
@InputType()
export class UpdateRecipesInput {
    @Field(() => String, { nullable: true })
    title: string;

    @Field(() => String, { nullable: true })
    summary: string;

    @Field(() => String, { nullable: true })
    types: string;

    @Field(() => [String], { nullable: true })
    mainUrl?: string[];

    @Field(() => [String], { nullable: true })
    contentsUrl?: string[];

    @Field(() => [String], { nullable: true })
    description?: string[];

    @Field(() => Int, { nullable: true })
    cookTime?: number;

    @Field(() => String,{ nullable: true })
    level?: string;

    @Field(() => Int, { nullable: true })
    serve?: number;

    @Field(() => [String], { nullable: true })
    ingredients?: string[];

    @Field(() => [String], { nullable: true })
    recipesTags?: string[];
}
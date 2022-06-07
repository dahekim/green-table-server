import { Field, InputType, Int } from "@nestjs/graphql";

@InputType()
export class CreateRecipesInput {
    @Field(() => String)
    title: string;

    @Field(() => String)
    summary: string;

    @Field(() => [String])
    types: string;

    @Field(() => [String])
    mainImage: string[];

    @Field(() => [String])
    url: string[];

    @Field(() => [String])
    description: string[];

    @Field(() => Int)
    cookTime: number;

    @Field(() => [String])
    level: string;

    @Field(() => Int)
    serve: number;

    @Field(() => [String])
    ingredients: string[];

    @Field(() => [String])
    recipesTags: string[];
}
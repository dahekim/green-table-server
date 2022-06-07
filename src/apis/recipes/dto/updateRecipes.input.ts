import { InputType, PartialType } from "@nestjs/graphql";
import { CreateRecipesInput } from "./createRecipes.input";

@InputType()
export class UpdateRecipesInput
    extends PartialType(CreateRecipesInput, InputType) { }
import { Field, Int, ObjectType } from "@nestjs/graphql";
import { Recipes } from "src/apis/recipes/entities/recipes.entity";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
@ObjectType()
export class RecipesContentsImage {
    @PrimaryGeneratedColumn()
    @Field(() => Int)
    contentsImage_id: number

    @Column({ default: " " })
    @Field(() => String, { defaultValue: " ", nullable: false })
    contentsUrl: string

    @Column({ length: 5000, default: " " })
    @Field(() => String, { defaultValue: " ", nullable: false })
    description: string

    @CreateDateColumn()
    createdAt: Date

    @DeleteDateColumn()
    deletedAt: Date

    @UpdateDateColumn()
    updatedAt: Date

    @ManyToOne(() => Recipes, (recipes) => recipes.recipesContentsImage, { onDelete: "CASCADE" })
    @Field(() => Recipes)
    recipes: Recipes
}
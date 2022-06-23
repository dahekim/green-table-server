import { Field, Int, ObjectType } from "@nestjs/graphql";
import { Recipes } from "src/apis/recipes/entities/recipes.entity";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
@ObjectType()
export class RecipesMainImage {
    @PrimaryGeneratedColumn()
    @Field(() => Int)
    mainImage_id: number

    @Column({ default: " " })
    @Field(() => String, { defaultValue: " ", nullable: true })
    mainUrl: string

    @CreateDateColumn()
    createdAt: Date

    @DeleteDateColumn()
    deletedAt: Date
    
    @UpdateDateColumn()
    updatedAt: Date

    @ManyToOne(() => Recipes, (recipes) => recipes.recipesMainImage, { onDelete: "CASCADE" })
    @Field(() => Recipes)
    recipes: Recipes
}
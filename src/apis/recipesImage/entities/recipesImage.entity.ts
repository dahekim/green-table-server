import { Field, Int, ObjectType } from "@nestjs/graphql";
import { Recipes } from "src/apis/recipes/entities/recipes.entity";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
@ObjectType()
export class RecipesImage {
    @PrimaryGeneratedColumn()
    @Field(() => Int)
    image_id: number

    @Column({ default: " " })
    @Field(() => String, { defaultValue: " ", nullable: false })
    mainImage: string;

    @Column({ default: " " })
    @Field(() => String, { defaultValue: " ", nullable: false })
    url: string

    @Column({ length: 5000, default: " " })
    @Field(() => String, { defaultValue: " ", nullable: false })
    description: string

    @CreateDateColumn()
    createdAt: Date

    @DeleteDateColumn()
    deletedAt: Date

    @UpdateDateColumn()
    updatedAt: Date

    @ManyToOne(() => Recipes, (recipes) => recipes.recipesImages, { onDelete: "CASCADE" })
    @Field(() => Recipes)
    recipes: Recipes
}
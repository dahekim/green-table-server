import { Field, ObjectType } from "@nestjs/graphql";
import { Recipes } from "src/apis/recipes/entities/recipes.entity";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
@ObjectType()
export class RecipesTag {
    @PrimaryGeneratedColumn('uuid')
    @Field(() => String)
    id: string;

    @Column({ nullable: false })
    @Field(() => String, { defaultValue: " ", nullable: false })
    name: string;

    @ManyToMany(() => Recipes, (recipes) => recipes.recipesTags)
    @Field(() => [Recipes])
    recipes: Recipes[];

    @CreateDateColumn()
    createdAt: Date;

    @DeleteDateColumn({default: null, nullable: true})
    deletedAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
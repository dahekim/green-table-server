import { Field, Int, ObjectType, registerEnumType } from "@nestjs/graphql";
import { RecipesIngredients } from "src/apis/recipesIngrediants/entities/recipesIngrediants.entity";
import { User } from "src/apis/user/entities/user.entity";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { RecipesTag } from "src/apis/recipesTag/entities/recipesTag.entity";
import { RecipesContentsImage } from "src/apis/recipesContentsImage/entities/recipesContentsImage.entity";
import { RecipeScrapHistory } from "src/apis/recipeScrap/entities/recipeScrap.entity";
import { RecipesMainImage } from "src/apis/recipesMainImage/entities/recipesMainImage.entity";

export enum CATEGORY_TYPES {
    NON_CHECKED = 'NON_CHECKED',
    VEGAN = 'VEGAN',
    LACTO = 'LACTO',
    OVO = 'OVO',
    LACTO_OVO = 'LACTO_OVO',
    PESCO = 'PESCO',
    POLLO = 'POLLO',
};
registerEnumType(CATEGORY_TYPES, {
    name: 'CATEGORY_TYPES',
});

export enum COOKING_LEVEL {
    SIMPLE = 'SIMPLE',
    NORMAL = 'NORMAL',
    DIFFICULT = 'DIFFICULT',
};
registerEnumType(COOKING_LEVEL, {
    name: 'COOKING_LEVEL',
});


@Entity()
@ObjectType()
export class Recipes {
    @PrimaryGeneratedColumn('uuid')
    @Field(() => String)
    id: string;

    @Column({ nullable: false })
    @Field(() => String!)
    title!: string;

    @Column({ nullable: false })
    @Field(() => String!)
    summary!: string;

    @Column({ type: 'enum', enum: CATEGORY_TYPES, default: CATEGORY_TYPES.VEGAN })
    @Field(() => CATEGORY_TYPES, { nullable: true })
    types?: CATEGORY_TYPES;

    @Column({ default: 0 })
    @Field(() => Int, { nullable: false })
    cookTime!: number;

    @Column({ type: 'enum', enum: COOKING_LEVEL, default: COOKING_LEVEL.NORMAL })
    @Field(() => COOKING_LEVEL, { nullable: true })
    level?: COOKING_LEVEL;

    @Column({ default: 0 })
    @Field(() => Int)
    serve: number;

    @OneToMany(()=> RecipesMainImage, (recipesMainImage)=>recipesMainImage.recipes, {cascade: true} )
    @Field(()=> [RecipesMainImage])
    recipesMainImage: RecipesMainImage[]

    @OneToMany(() => RecipesContentsImage, (recipesContentsImage) => recipesContentsImage.recipes, { cascade: true })
    @Field(() => [RecipesContentsImage])
    recipesContentsImage: RecipesContentsImage[];

    @OneToMany(() => RecipeScrapHistory, (recipeScrapsHistory) => recipeScrapsHistory.recipes)
    @Field(() => [RecipeScrapHistory])
    recipesScraps: RecipeScrapHistory[];

    @ManyToOne(() => User, {nullable: false})
    @Field(() => User)
    user?: User;

    @JoinTable()
    @ManyToMany(() => RecipesIngredients, (ingredients) => ingredients.recipes)
    @Field(() => [RecipesIngredients])
    ingredients: RecipesIngredients[];

    @JoinTable()
    @ManyToMany(() => RecipesTag, (recipesTags) => recipesTags.recipes)
    @Field(() => [RecipesTag])
    recipesTags: RecipesTag[];

    @Column({ default: 0 })
    @Field(() => Int)
    scrapCount?: number;

    @Column({ default: 0 })
    @Field(() => Int)
    replyCount?: number;

    @CreateDateColumn()
    @Field(() => Date)
    createdAt: Date;

    @DeleteDateColumn()
    deletedAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
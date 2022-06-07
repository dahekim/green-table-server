import { Field, Int, ObjectType } from "@nestjs/graphql";
import { Recipes } from "src/apis/recipes/entities/recipes.entity";
import { User } from "src/apis/user/entities/user.entity";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";


@Entity()
@ObjectType()
export class RecipesReply {
    @PrimaryGeneratedColumn('uuid')
    @Field(() => String)
    reply_id!: string; 

    @Column()
    @Field(() => String, { nullable: true })
    contents!: string;

    @ManyToOne(()=> Recipes, {nullable: true})
    @Field(()=> Recipes)
    recipes: Recipes

    @ManyToOne(() => User, { onDelete: 'CASCADE',onUpdate: 'CASCADE'} )
    @Field(() => User)
    user: User

    @CreateDateColumn()
    @Field(()=>Date)
    createdAt: Date;

    @DeleteDateColumn()
    deletedAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
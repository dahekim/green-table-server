import { Field, Int, ObjectType, registerEnumType } from "@nestjs/graphql";
import { RecipeScrapHistory } from "src/apis/recipeScrap/entities/recipeScrap.entity";
import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from "typeorm";

export enum CLASS_TYPE {
    PRO = 'PRO',
    COMMON = 'COMMON',
}

export enum VEGAN_TYPE{
    NON_Vegan='NON_Vegan',
    Vegan='Vegan',
    Lacto='Lacto',
    Ovo='Ovo',
    Lacto_Ovo='Lacto_Ovo',
    Pesco='Pesco',
    Pollo='Pollo',
}

export enum SUB_TYPE {
    NON_SUB = 'NON_SUB',
    BASIC = 'BASIC',
    PREMIUM = 'PREMIUM',
}

registerEnumType(CLASS_TYPE, {
    name: 'CLASS_TYPE',
})

registerEnumType(VEGAN_TYPE, {
    name: 'VEGAN_TYPE',
})

registerEnumType(SUB_TYPE, {
    name: 'SUB_TYPE',
})

@Entity()
@ObjectType()
export class User {
    @PrimaryGeneratedColumn("uuid")
    @Field(() => String)
    user_id!: string

    @Column({ nullable: false })
    @Field(() => String!)
    email!: string

    @Column({ nullable: false })
    password: string

    @Column({ nullable: false })
    @Field(() => String!)
    name!: string

    @Column({ nullable: false })
    @Field(() => String!, )
    phone: string

    @Column({ default: null })
    @Field(() => String, { nullable: true })
    address?: string

    @Column({ default: null })
    @Field(() => String, { nullable: true })
    addressDetail?: string

    @Column({type: "enum", enum: VEGAN_TYPE, default: VEGAN_TYPE.NON_Vegan })
    @Field(()=>VEGAN_TYPE, {nullable: true})
    type?: string

    @Column({ nullable: true })
    @Field(() => String, { nullable: true })
    nickname?: string

    @Column({ type: "enum", enum: CLASS_TYPE, default: CLASS_TYPE.COMMON })
    @Field(() => CLASS_TYPE, { nullable: true })
    isPro?: string

    @Column({nullable: true})
    @Field(()=> String, {nullable: true})
    certImage?: string

    @Column({nullable: true})
    @Field(()=> String, {nullable: true})
    certUrl?: string

    @Column({ type: "enum", enum: SUB_TYPE, default: SUB_TYPE.NON_SUB })
    @Field(() => SUB_TYPE, { nullable: true })
    isSubs?: string;

    @Column({ default: 0 })
    @Field(() => Int, { nullable: true })
    SubsHistory?: number

    @Column({ default: null })
    @Field(() => String, { nullable: true })
    startDate?: string

    @Column({ default: null })
    @Field(() => String, { nullable: true })
    endDate?: string

    @Column({ type: 'varchar', default: " ", nullable: true })
    @Field(() => String, { nullable: true })
    profilePic: string;

    @Column({default: 0})
    @Field(()=> RecipeScrapHistory, { nullable: true })
    scrapCount?: number

    @CreateDateColumn()
    createdAt: Date

    @DeleteDateColumn()
    @Field(() => Date, { nullable: true })
    deletedAt: Date

    @UpdateDateColumn()
    updatedAt: Date
}
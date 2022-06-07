import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class UpdateUserInput {
    @Field(() => String, {nullable: true})
    name?: string
    
    @Field(() => String, { nullable: true })
    phone?: string

    @Field(()=>String, {nullable: true})
    address?: string

    @Field(()=>String, {nullable: true})
    addressDetail?: string

    @Field(()=> String, {nullable: true})
    type?: string

    @Field(()=> String, {nullable: true})
    nickname?: string    

    @Field(()=> String, {nullable: true})
    isPro?: string
    
    @Field(()=> String, {nullable: true})
    certImage?: string

    @Field(()=> String, {nullable: true})
    certUrl?: string

    @Field(()=> Boolean, {nullable: true})
    isSubs?: boolean

    @Field(()=> String, {nullable: true})
    profilePic?: string
}

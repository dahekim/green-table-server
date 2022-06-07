import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm';
import { Connection, getRepository, Repository } from 'typeorm';
import { Recipes } from '../recipes/entities/recipes.entity';
import { User } from '../user/entities/user.entity';
import { RecipesReply } from './entities/recipes.reply.entity';

@Injectable()
export class RecipesReplyService{
    constructor(
        @InjectRepository(RecipesReply)
        private readonly recipesReplyRepository: Repository<RecipesReply>,

        @InjectRepository(Recipes)
        private readonly recipesRepository: Repository<Recipes>,

        @InjectRepository(User)
        private readonly userRepository: Repository<User>,

        private readonly connection: Connection,
    ){}

    async findAll({recipe_id, page}){
        const replies = await getRepository(RecipesReply)
        .createQueryBuilder('recipesReply')
        .leftJoinAndSelect('recipesReply.recipes', 'recipe')
        .leftJoinAndSelect('recipesReply.user', 'user')
        .where('recipe.id = :id', { id: recipe_id })
        .orderBy('recipesReply.createdAt', 'ASC')
        .take(12)

        if(page){
            const result = await replies.skip((page-1) * 12).getMany()
        return result
        } else {
            const result = await replies.getMany()
            return result
        }
    }

    async create({currentUser, contents, recipe_id}){
        const queryRunner = this.connection.createQueryRunner()
        await queryRunner.connect()
        await queryRunner.startTransaction('REPEATABLE READ')
        
        try {
            const user = await queryRunner.manager.findOne(User, { user_id: currentUser.user_id })
            const recipe = await queryRunner.manager.findOne(Recipes, { id: recipe_id })
            const createRecipe = await this.recipesRepository.create({ ...recipe })
            
            const createReply = await this.recipesReplyRepository.create({
                recipes : createRecipe,
                contents: contents,
                user: user,
            })

            const updateReplyCount = await this.recipesRepository.create({
                ...recipe,
                replyCount: recipe.replyCount + 1
            })
            
            await queryRunner.manager.save(createRecipe)
            await queryRunner.manager.save(createReply)
            await queryRunner.manager.save(updateReplyCount)
            await queryRunner.commitTransaction()

            return "댓글이 정상적으로 등록되었습니다."
        } catch (error) {
            await queryRunner.rollbackTransaction()
            throw error
        } finally {
            await queryRunner.release()
        }
    }

    async update({ reply_id, recipe_id, contents }) {
        const recipe = await this.recipesRepository.findOne({ id: recipe_id })
        const reply = await this.recipesReplyRepository.findOne({ reply_id })

        const result=  await this.recipesReplyRepository.save({
            ...reply,
            contents,
        })
        return result ? "댓글이 수정되었습니다.": "댓글 수정에 실패했습니다."
    }
    
    
    async delete({ currentUser, reply_id, recipe_id }) {
        const user = await this.userRepository.findOne({ user_id: currentUser.user_id })
        const recipe = await this.recipesRepository.findOne({ id: recipe_id })
        const reply = await this.recipesReplyRepository.findOne({ reply_id })
        
        if (reply) {
            const result = await this.recipesReplyRepository.softDelete({reply_id})
            await this.recipesRepository.save({
                ...recipe,
                user,
                replyCount: recipe.replyCount -1
            })
        return result.affected ? "댓글이 삭제되었습니다.": "댓글 삭제에 실패했습니다."
    }
    return "댓글이 정상적으로 삭제되었습니다."
    }
}

import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Connection, getRepository, Repository } from "typeorm";
import { Recipes } from "../recipes/entities/recipes.entity";
import { User } from "../user/entities/user.entity";
import { RecipeScrapHistory } from "./entities/recipeScrap.entity";

@Injectable()
export class RecipeScarpService{
    constructor(
        @InjectRepository(RecipeScrapHistory)
        private readonly scrapHistoryRepository: Repository<RecipeScrapHistory>,

        @InjectRepository(Recipes)
        private readonly recipesRepository: Repository<Recipes>,

        @InjectRepository(User)
        private readonly userRepository: Repository<User>,

        private readonly connection: Connection
    ){}
    async findAll({ user_id }){
        return await getRepository(Recipes)
        .createQueryBuilder('recipes')
        .leftJoinAndSelect('recipes.user', 'user')
        .leftJoinAndSelect('recipes.recipesScraps','recipeScraped')
        .leftJoinAndSelect('recipes.recipesImages', 'image')
        .leftJoinAndSelect('recipes.ingredients', 'ingredients')
        .leftJoinAndSelect('recipes.recipesTags', 'tags')
        .leftJoinAndSelect('recipeScraped.user','scrappedUser')        
        .where('recipeScraped.scraped',{ scraped: true })
        .andWhere('scrappedUser.user_id = :user_id',{ user_id } )
        .orderBy('recipes.createdAt', 'DESC')
        .getMany();
    }

    async scrap({recipe_id, currentUser}){
        const queryRunner = await this.connection.createQueryRunner()
        const queryBuilder = await this.connection.createQueryBuilder()
        await queryRunner.connect()
        await queryRunner.startTransaction('SERIALIZABLE')
        
        const user = await this.userRepository.findOne({ where: { user_id: currentUser.user_id }})
        const recipe = await this.recipesRepository.findOne({where: { id: recipe_id }})

        try {
            const scrap = await queryRunner.manager.findOne( RecipeScrapHistory, {
                user: currentUser.user_id,
                recipes: recipe_id,
            })
            

            if (!scrap) {
                const createScrapHistory = await this.scrapHistoryRepository.create({
                    scraped: true,
                    user: user,
                    recipes: recipe,
                })
                    
                const updateRecipeScrapCount = await this.recipesRepository.create({
                    ...recipe,
                    scrapCount: recipe.scrapCount + 1,
                })
                await queryRunner.manager.save(updateRecipeScrapCount)
                const result = await queryRunner.manager.save(createScrapHistory);
                await queryRunner.commitTransaction()
                return result
            }

            if (!scrap.scraped) {
                const createScrapHistory = await this.scrapHistoryRepository.create({
                    ...scrap,
                    scraped: true,
                    user: user,
                    recipes: recipe,
                })
                const updateRecipeScrapCount = await this.recipesRepository.create({
                    ...recipe,
                    scrapCount: recipe.scrapCount + 1,
                })
                
                await queryRunner.manager.save(updateRecipeScrapCount);

                const result = await queryRunner.manager.save(createScrapHistory);
                await queryRunner.commitTransaction();
                return result;
            }

            if (scrap.scraped){
                const createScrapHistory = await this.scrapHistoryRepository.create({
                    ...scrap,
                    scraped: false,
                    user: user,
                    recipes: recipe,
                })

                const updateRecipeScrap = await this.recipesRepository.create({
                    ...recipe,
                    scrapCount: recipe.scrapCount - 1 
                })
                    await queryRunner.manager.save(updateRecipeScrap)
                    const result = await queryRunner.manager.save(createScrapHistory)
                        
                    await queryRunner.commitTransaction()
                    return result
            }
            
        } catch (error) {
            await queryRunner.rollbackTransaction()

        } finally {
            await queryRunner.release();
        }
    }
}
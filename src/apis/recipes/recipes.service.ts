import { ConflictException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { timingSafeEqual } from "crypto";
import { Connection, getRepository, Repository } from "typeorm";
import { RecipesImage } from "../recipesImage/entities/recipes.image.entity";
import { CLASS_TYPE, SUB_TYPE, User } from "../user/entities/user.entity";
import { CreateRecipesInput } from "./dto/createRecipes.input";
import { CATEGORY_TYPES, COOKING_LEVEL, Recipes } from "./entities/recipes.entity";

export interface ICreateRecipes {
    createRecipesInput: CreateRecipesInput
}

// interface IUpdateRecipes {
//     id: string
//     updateRecipesInput: UpdateRecipesInput
// }


@Injectable()
export class RecipesService {
    constructor(
        @InjectRepository(Recipes)
        private readonly recipesRepository: Repository<Recipes>,

        @InjectRepository(RecipesImage)
        private readonly recipesImageRepository: Repository<RecipesImage>,

        @InjectRepository(User)
        private readonly userRepository: Repository<User>,

        private readonly connection: Connection,
        private readonly createRecipesInput: CreateRecipesInput,
    ) { }

    async fetchRecipesAll() {
        await this.recipesRepository.findOne({
            types: CATEGORY_TYPES.ALL
        });
    }
    async fetchRecipeTypes({ id, typesCode }) {
        const checkedType = await this.recipesRepository.findOne({
            where: { id }
        })
        const { types, ...rest } = checkedType
        if (checkedType.types !== 'ALL') {
            let typesEnum: CATEGORY_TYPES;
            if (typesCode === "VEGAN") typesEnum = CATEGORY_TYPES.VEGAN;
            else if (typesCode === "LACTO") typesEnum = CATEGORY_TYPES.LACTO;
            else if (typesCode === "OVO") typesEnum = CATEGORY_TYPES.OVO;
            else if (typesCode === "LACTO-OVO") typesEnum = CATEGORY_TYPES.LACTO_OVO;
            else if (typesCode === "PESCO") typesEnum = CATEGORY_TYPES.PESCO;
            else if (typesCode === "POLLO") typesEnum = CATEGORY_TYPES.POLLO;
            else {
                console.log('정확한 채식 타입을 선택해 주세요.');
                throw new ConflictException('적합한 채식 타입을 선택하지 않으셨습니다.');
            }
            const collectedTypes = await this.recipesRepository.create({
                types: typesEnum,
                ...rest
            });
            const result = await this.recipesRepository.save(collectedTypes);
            return result;
        }
    }

    async fetchRecipesWithNickname({ nickname }) {
        return await getRepository(Recipes)
            .createQueryBuilder('recipes')
            .leftJoinAndSelect('recipes.user', 'user')
            .where('user.nickname = :userUserNickname', { nickname })
            .orderBy('recipes.createdAt', 'DESC')
            .getManyAndCount();
    }

    async fetchRecipesWithIsPro({ isPro }) {
        return await getRepository(Recipes)
            .createQueryBuilder('recipes')
            .leftJoinAndSelect('recipes.user', 'user')
            .where('user.isPro = :userIsPro', { isPro })
            .orderBy('recipes.createdAt', 'DESC')
            .getManyAndCount();
    }

    async create(
        { createRecipesInput }: ICreateRecipes, currentUser,
    ) {
        const recipesInput = new CreateRecipesInput();
        recipesInput.desc = { image: "url", text: "text" };
        const queryRunner = await this.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction('SERIALIZABLE')
        try {
            const writeRecipe = await this.recipesRepository.create({

                user: currentUser,
            });
            await queryRunner.manager.save(writeRecipe);

            const user = await queryRunner.manager.findOne(
                User,
                { user_id: currentUser.user_id },
                { lock: { mode: 'pessimistic_write' } }
            );

            const registRecipe = await this.userRepository.create({
                ...user,
                isPro: currentUser.isPro,
            });
            if (registRecipe.isPro === 'COMMON') {
                throw new MessageEvent('작성자: 일반인');
            } else if (registRecipe.isPro === 'PRO') {
                throw new MessageEvent('작성자: 전문가');
            }
            await queryRunner.manager.save(registRecipe);
            await queryRunner.commitTransaction();
            return writeRecipe;

        } catch (error) {
            console.log(error)
            if (error?.response?.data?.message || error?.response?.status) {
                console.log(error.response.data.message);
                console.log(error.response.status);
            } else {
                throw error;
            }
            await queryRunner.rollbackTransaction();
        } finally {
            await queryRunner.release();
        }

    }

    async update({ id, updateRecipesInput }) {
        const checkRecipe = await this.recipesRepository.findOne({
            where: { id }
        });

        const newRegistRecipe = {
            ...checkRecipe,
            ...updateRecipesInput,
        }
        return await this.recipesRepository.save(newRegistRecipe);
    }

    async delete({ id, currentUser }) {
        const queryRunner = await this.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction('SERIALIZABLE')

        try {
            const user = await queryRunner.manager.findOne(
                User,
                { user_id: currentUser.user_id },
                { lock: { mode: 'pessimistic_write' } }
            );
            const result = await this.recipesRepository.softDelete({
                id,
                ...user,
                user: currentUser.user_id,
            });
            return result.affected ? true : false;
        } catch (error) {
            console.log(error)
            if (error?.response?.data?.message || error?.response?.status) {
                console.log(error.response.data.message);
                console.log(error.response.status);
            } else {
                throw error;
            }
            await queryRunner.rollbackTransaction();
        } finally {
            await queryRunner.release();
        }
    }
}
import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FileUpload } from "graphql-upload";
import { Brackets, getConnection, getRepository, Repository } from "typeorm";
import { User } from "../user/entities/user.entity";
import { Recipes } from "./entities/recipes.entity";
import { Storage } from '@google-cloud/storage'
import { RecipesContentsImage } from "../recipesContentsImage/entities/recipesContentsImage.entity";
import { RecipesIngredients } from "../recipesIngrediants/entities/recipesIngrediants.entity";
import { RecipesTag } from "../recipesTag/entities/recipesTag.entity";
import { RecipesMainImage } from "../recipesMainImage/entities/recipesMainImage.entity";

interface IFile {
    files: FileUpload[]
}

@Injectable()
export class RecipesService {
    constructor(
        @InjectRepository(Recipes)
        private readonly recipesRepository: Repository<Recipes>,

        @InjectRepository(RecipesContentsImage)
        private readonly recipesContentsImageRepository: Repository<RecipesContentsImage>,

        @InjectRepository(RecipesMainImage)
        private readonly recipesMainImageRepository: Repository<RecipesMainImage>,

        @InjectRepository(User)
        private readonly userRepository: Repository<User>,

        @InjectRepository(RecipesIngredients)
        private readonly recipesIngredientsRepository: Repository<RecipesIngredients>,

        @InjectRepository(RecipesTag)
        private readonly recipesTagRepository: Repository<RecipesTag>,
    ) { }

    // 전체 레시피 조회
    async fetchRecipesAll(page) {
        const temp = await getRepository(Recipes)
            .createQueryBuilder('recipes')
            .leftJoinAndSelect('recipes.user', 'user')
            // .leftJoinAndSelect('recipes.recipesImages', 'image')
            .leftJoinAndSelect('recipes.recipesMainImage', 'mainPic')
            .leftJoinAndSelect('recipes.recipesContentsImage', 'contentsPic')
            .leftJoinAndSelect('recipes.ingredients', 'ingredients')
            .leftJoinAndSelect('recipes.recipesTags', 'recipesTags')
            .leftJoinAndSelect('recipes.recipesScraps', 'recipesScraps')
            .leftJoinAndSelect('recipesScraps.user', 'users')
            .orderBy('recipes.createdAt', 'DESC')

        if (page) {
            const result = temp.take(12).skip((page-1) * 12).getMany()
            return result
        } else {
            const result = temp.getMany()
            return result
        }
    }

    // 레시피 전체 갯수 카운트
    async fetchRecipesCount(page) {
        const temp = await getRepository(Recipes)
            .createQueryBuilder('recipes')
            .leftJoinAndSelect('recipes.user', 'user')
            // .leftJoinAndSelect('recipes.recipesImages', 'image')
            .leftJoinAndSelect('recipes.recipesMainImage', 'mainPic')
            .leftJoinAndSelect('recipes.recipesContentsImage', 'contentsPic')
            .leftJoinAndSelect('recipes.ingredients', 'ingredients')
            .leftJoinAndSelect('recipes.recipesTags', 'recipesTags')
            .leftJoinAndSelect('recipes.recipesScraps', 'recipesScraps')
            .leftJoinAndSelect('recipesScraps.user', 'users')
            .orderBy('recipes.createdAt', 'DESC')

        if (page) {
            const result = await temp.take(12).skip((page-1) * 12).getCount()
            return result
        } else {
            const result = await temp.getCount()
            return result
        }    
    }

    // 인기 레시피 조회
    async fetchPopularRecipes(page) {
        const temp = await getRepository(Recipes)
            .createQueryBuilder('recipes')
            .leftJoinAndSelect('recipes.user', 'user')
            // .leftJoinAndSelect('recipes.recipesImages', 'image')
            .leftJoinAndSelect('recipes.recipesMainImage', 'mainPic')
            .leftJoinAndSelect('recipes.recipesContentsImage', 'contentsPic')
            .leftJoinAndSelect('recipes.ingredients', 'ingredients')
            .leftJoinAndSelect('recipes.recipesTags', 'recipesTags')
            .leftJoinAndSelect('recipes.recipesScraps', 'recipesScraps')
            .leftJoinAndSelect('recipesScraps.user', 'users')
            .orderBy('recipes.scrapCount','DESC' )
            .addOrderBy('recipes.createdAt', 'DESC')

        if (page) {
            const result = await temp.take(12).skip((page-1) * 12).getMany()
            return result
        } else {
            const result = await temp.getMany()
            return result
        }
    }

    // 전문가 레시피 조회
    async fetchRecipeIsPro({ isPro, page }) {
        const temp = await getRepository(Recipes)
            .createQueryBuilder('recipes')
            .leftJoinAndSelect('recipes.user', 'user')
            // .leftJoinAndSelect('recipes.recipesImages', 'image')
            .leftJoinAndSelect('recipes.recipesMainImage', 'mainPic')
            .leftJoinAndSelect('recipes.recipesContentsImage', 'contentsPic')
            .leftJoinAndSelect('recipes.ingredients', 'ingredients')
            .leftJoinAndSelect('recipes.recipesTags', 'recipesTags')
            .leftJoinAndSelect('recipes.recipesScraps', 'recipesScraps')
            .leftJoinAndSelect('recipesScraps.user', 'users')
            .where('user.isPro = :isPro', { isPro: "PRO" })
            .orderBy('recipes.createdAt', 'DESC')

        if (page) {
            const result = await temp.take(12).skip((page-1) * 12).getMany()
            return result
        } else {
            const result = await temp.getMany()
            return result
        }
    }

    // 레시피 조회
    async fetchRecipe({ id }) {
        return await getConnection()
            .createQueryBuilder()
            .select('recipes')
            .from(Recipes, 'recipes')
            .leftJoinAndSelect('recipes.user', 'user')
            // .leftJoinAndSelect('recipes.recipesImages', 'image')
            .leftJoinAndSelect('recipes.recipesMainImage', 'mainPic')
            .leftJoinAndSelect('recipes.recipesContentsImage', 'contentsPic')
            .leftJoinAndSelect('recipes.ingredients', 'ingredients')
            .leftJoinAndSelect('recipes.recipesTags', 'recipesTags')
            .leftJoinAndSelect('recipes.recipesScraps', 'recipesScraps')
            .leftJoinAndSelect('recipesScraps.user', 'users')
            .where({ id })
            .orderBy('recipes.createdAt', 'DESC')
            .getOne()
    }

    // 타입별 레시피 조회
    async fetchRecipeTypes({ types, page }) {
        const temp =  await getConnection()
            .createQueryBuilder()
            .select('recipes')
            .from(Recipes, 'recipes')
            .leftJoinAndSelect('recipes.user', 'user')
            // .leftJoinAndSelect('recipes.recipesImages', 'image')
            .leftJoinAndSelect('recipes.recipesMainImage', 'mainPic')
            .leftJoinAndSelect('recipes.recipesContentsImage', 'contentsPic')
            .leftJoinAndSelect('recipes.ingredients', 'ingredients')
            .leftJoinAndSelect('recipes.recipesTags', 'recipesTags')
            .leftJoinAndSelect('recipes.recipesScraps', 'recipesScraps')
            .leftJoinAndSelect('recipesScraps.user', 'users')
            .where({ types })
            .orderBy('recipes.createdAt', 'DESC')

        if (page) {
            const result = await temp.take(12).skip((page-1) * 12).getMany()
            return result
        } else {
            const result = await temp.getMany()
            return result
        }
    }

    // 타입별 인기 레시피 조회
    async fetchRecipeTypesPopular({ types, page }) {
        const temp = await getConnection()
            .createQueryBuilder()
            .select('recipes')
            .from(Recipes, 'recipes')
            .leftJoinAndSelect('recipes.user', 'user')
            // .leftJoinAndSelect('recipes.recipesImages', 'image')
            .leftJoinAndSelect('recipes.recipesMainImage', 'mainPic')
            .leftJoinAndSelect('recipes.recipesContentsImage', 'contentsPic')
            .leftJoinAndSelect('recipes.ingredients', 'ingredients')
            .leftJoinAndSelect('recipes.recipesTags', 'recipesTags')
            .leftJoinAndSelect('recipes.recipesScraps', 'recipesScraps')
            .leftJoinAndSelect('recipesScraps.user', 'users')
            .where({ types })
            .orderBy('recipes.scrapCount','DESC' )
            .addOrderBy('recipes.createdAt', 'DESC')

        if (page) {
            const result = await temp.take(12).skip((page-1) * 12).getMany()
            return result
        } else {
            const result = await temp.getMany()
            return result
        }   
    }

    // 내가 쓴 레시피 조회
    async fetchMyRecipe({ user_id, page }) {
        const temp = await getRepository(Recipes)
            .createQueryBuilder('recipes')
            .leftJoinAndSelect('recipes.user', 'user')
            // .leftJoinAndSelect('recipes.recipesImages', 'image')
            .leftJoinAndSelect('recipes.recipesMainImage', 'mainPic')
            .leftJoinAndSelect('recipes.recipesContentsImage', 'contentsPic')
            .leftJoinAndSelect('recipes.ingredients', 'ingredients')
            .leftJoinAndSelect('recipes.recipesTags', 'recipesTags')
            .leftJoinAndSelect('recipes.recipesScraps', 'recipesScraps')
            .leftJoinAndSelect('recipesScraps.user', 'users')
            .where('user.user_id = :user_id', { user_id })
            .orderBy('recipes.createdAt', 'DESC')

        if (page) {
            const result = await temp.take(12).skip((page-1) * 12).getMany()
            return result
        } else {
            const result = await temp.getMany()
            return result
        }
    }

    

    async create({ createRecipesInput }, currentUser) {
        try {
            const { MainUrl, contentsUrl, description, ingredients, recipesTags, ...recipes } =
                createRecipesInput;

            const user = await this.userRepository.findOne(
                currentUser,
                { where: { user_id: currentUser.user_id } }
            );

            const ingredientTags = [];
            if (ingredients.length) {
                for (let i = 0; i < ingredients.length; i++) {
                    const ingredientTag = ingredients[i].replace('#', '');
                    const prevTag = await this.recipesIngredientsRepository.findOne({
                        name: ingredientTag
                    });

                    if (prevTag) {
                        ingredientTags.push(prevTag);
                    } else {
                        const newTag = await this.recipesIngredientsRepository.save({ name: ingredientTag });
                        ingredientTags.push(newTag);
                    }
                }
            }

            const recipeTags = [];
            if (recipesTags.length) {
                for (let i = 0; i < recipesTags.length; i++) {
                    const recipeTag = recipesTags[i].replace('#', '');
                    const prevTags = await this.recipesTagRepository.findOne({
                        name: recipeTag
                    });

                    if (prevTags) {
                        recipeTags.push(prevTags);
                    } else {
                        const newTags = await this.recipesTagRepository.save({
                            name: recipeTag,
                        })
                        recipeTags.push(newTags);
                    }
                }
            }

            const result = await this.recipesRepository.save({
                ...recipes,
                user: user,
                ingredients: ingredientTags,
                recipesTags: recipeTags,
            });

            for (let i = 0; i < contentsUrl.length; i++) {
                await this.recipesMainImageRepository.save({
                    MainUrl: MainUrl[i],
                    recipes: result
                });
            }

            for (let i = 0; i < contentsUrl.length; i++) {
                await this.recipesContentsImageRepository.save({
                    contentsUrl: contentsUrl[i],
                    description: description[i],
                    recipes: result
                });
            }
            return await result;

        } catch (error) {
            console.log(error)
            if (error?.response?.data?.message || error?.response?.status) {
                console.log(error.response.data.message);
                console.log(error.response.status);
            } else {
                throw error;
            }
        }
    }

    async update({ id, updateRecipesInput }) {
        const registedRecipe = await this.recipesRepository.findOne({
            where: { id }
        });

        const newRegistRecipe = {
            ...registedRecipe,
            ...updateRecipesInput,
        }
        return await this.recipesRepository.save(newRegistRecipe);
    }

    async delete({ id, currentUser }) {
        try {
            const result = await this.recipesRepository.softDelete({
                id,
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
        }
    }

    async uploadImage({ file, fileName }) {
        const bucket = process.env.VEGAN_STORAGE_BUCKET
        const storage = new Storage({
            keyFilename: process.env.STORAGE_KEY_FILENAME,
            projectId: process.env.STORAGE_PROJECT_ID,
        }).bucket(bucket)

        const url = await new Promise((resolve, reject) => {
            file
                .createReadStream()
                .pipe(storage.file(fileName).createWriteStream())
                .on("finish", () => resolve(`${bucket}/${fileName}`))
                .on("error", (error) => reject("🔔" + error));
        })
        return url
    }


    async search({ input, page }) {
        const results = getRepository(Recipes)
            .createQueryBuilder('recipes')
            .leftJoinAndSelect('recipes.ingredients', 'ingredients')
            .leftJoinAndSelect('recipes.recipesTags', 'tags')

        if (input === null || input === "") {
            throw new BadRequestException("검색어를 입력해주세요.")
        }

        if (input) {
            results.where(
                new Brackets((qb) => {
                    qb.where('recipes.title LIKE :title', { title: `%${input}%` })
                        .orWhere('ingredients.name LIKE :name', { name: `%${input}%` })
                        .orWhere('tags.name LIKE :name', { name: `%${input}%` })
                })
            )
        }

        if (page) {
            const result = await results.orderBy('recipes.createdAt', 'DESC')
                .getMany()
            return result
        } else {
            const result = await results.orderBy('recipes.createdAt', 'DESC')
                .getMany()
            return result
        }
    }
}

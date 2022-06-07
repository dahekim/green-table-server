import { CACHE_MANAGER, ConflictException, HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Cache } from 'cache-manager'
import { Repository } from "typeorm";
import { User } from "./entities/user.entity";
import { Storage } from '@google-cloud/storage';
import axios from 'axios'
import { getToday } from 'src/commons/libraries/utils';


@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,

        @Inject(CACHE_MANAGER)
        private readonly cacheManager: Cache,
    ) { }

    async findAll() {
        return await this.userRepository.find()
    }

    async findOne({ email }) {
        const myInfo = await this.userRepository.findOne({
            where: { email: email }
        })
        return myInfo
    }

    async withDelete() {
        return await this.userRepository.find({
            withDeleted: true
        })
    }

    async create({ email, password, name, phone }) {
        const user = await this.userRepository.findOne({ email })
        if (user) throw new ConflictException("이미 등록된 이메일입니다.")
        return await this.userRepository.save({ email, password, name, phone })
    }

    async createSocial({ email, password, name, phone }) {
        const user = await this.userRepository.findOne({ email })
        if (user) throw new ConflictException("이미 등록된 소셜 계정입니다.")
        return await this.userRepository.save({ email, password, name, phone })
    }

    async update({ user_id, updateUserInput }) {
        const user = await this.userRepository.findOne({
            where: { user_id: user_id },
        })
        const updateUser = {
            ...user,
            ...updateUserInput,
        }
        return await this.userRepository.save(updateUser)
    }

    async updatePassword({ user_id, hashedPassword: password }) {
        const user = await this.userRepository.findOne({
            where: { user_id: user_id },
        })
        const updateUser = {
            ...user,
            password
        }
        return await this.userRepository.save(updateUser)
    }

    async delete({ user_id }) {
        const result = await this.userRepository.update(
            { user_id },
            { deletedAt: new Date() }
        )
        return result ? true : false
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



    async deleteImage({ user_id }) {
        const bucket = process.env.VEGAN_STORAGE_BUCKET
        const userId = await this.userRepository.findOne({ user_id: user_id })

        const prevImage = userId.profilePic.split(`${bucket}/profile/${getToday()}/`)
        const prevImageName = prevImage[prevImage.length - 1]

        const storage = new Storage({
            keyFilename: process.env.STORAGE_KEY_FILENAME,
            projectId: process.env.STORAGE_PROJECT_ID,
        })

        const result = await storage
            .bucket(process.env.STORAGE_BUCKET)
            .file(prevImageName)
            .delete()

        const { profilePic, ...user } = userId
        const deleteUrl = { ...user, profilePic: null }
        await this.userRepository.save(deleteUrl)

        return result ? true : false
    }


    async sendTokenToSMS({ phone }) {
        const phNum = await this.userRepository.findOne({
            where: { phone: phone }
        })
        if (phNum) {
            throw new ConflictException("이미 등록된 번호입니다.")
        }

        const token = String(Math.floor(Math.random() * 10 ** 6)).padStart(6, "0")

        const appKey = process.env.SMS_APP_KEY
        const XSecretKey = process.env.SMS_X_SECRET_KEY


        try {
            await axios.post(
                `https://api-sms.cloud.toast.com/sms/v3.0/appKeys/${appKey}/sender/sms`,
                {
                    body: `채식한상 가입 인증번호는 [${token}] 입니다.`,
                    sendNo: process.env.SMS_SENDER,
                    recipientList: [{ internationalRecipientNo: phone }]
                },
                {
                    headers: {
                        "X-Secret-Key": XSecretKey,
                        "Content-Type": "application/json;charset=UTF-8",
                    }
                },
            )
            const myToken = await this.cacheManager.get(phone)
            if (myToken) {
                await this.cacheManager.del(phone)
            }
            await this.cacheManager.set(phone, token,
                {
                    ttl: 180,
                })
            return token

        } catch (error) {
            throw new HttpException(
                {
                    status: HttpStatus.BAD_REQUEST,
                    error: '오류 : 해당 번호로 메시지를 보낼 수 없습니다.'
                },
                HttpStatus.BAD_REQUEST
            )
        }
    }
    async isMatch({ phone, token }) {
        const myToken = await this.cacheManager.get(phone);

        if (myToken === token) {
            await this.cacheManager.del(phone)
            return true
        }
        return false
    }
}
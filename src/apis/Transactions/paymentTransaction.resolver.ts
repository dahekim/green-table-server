import { UseGuards } from "@nestjs/common";
import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { InjectRepository } from "@nestjs/typeorm";
import { GqlAuthAccessGuard } from "src/commons/auth/gql-auth.guard";
import { CurrentUser, ICurrentUser } from "src/commons/auth/gql-user.param";
import { getToday, oneMonthLater } from "src/commons/libraries/utils";
import { Repository } from "typeorm";
import { IamportService } from "../iamport/iamport.service";
import { PaymentTransaction } from "../Transactions/entities/paymentTransaction.entity";
import { PaymentTransactionService } from "../Transactions/paymentTransaction.service";
import { User, SUB_TYPE } from "../user/entities/user.entity";


@Resolver()
export class PaymentTransactionResolver {
    constructor(
        private readonly paymentTransactionService: PaymentTransactionService,
        private readonly iamportService: IamportService,
        
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,

        @InjectRepository(PaymentTransaction)
        private readonly paymentRepository: Repository<PaymentTransaction>,
    ) {}

    @UseGuards(GqlAuthAccessGuard)
    @Query(() => [PaymentTransaction])
    async fetchTransactionAll() {
        return await this.paymentTransactionService.fetchTransactionAll()
    }

    @UseGuards(GqlAuthAccessGuard)
    @Query(() => [PaymentTransaction])
    async fetchimpUidwithUserid(
        @Args('user_id') user_id: string,
    ) {
        return this.paymentTransactionService.fetchimpUidwithUserid({ user_id })
    }

    @UseGuards(GqlAuthAccessGuard)
    @Query(() => [PaymentTransaction])
    async fetchMyPayment(
        @CurrentUser() currentUser: ICurrentUser,
    ) {
        const user_id = currentUser.user_id
        return this.paymentTransactionService.fetchimpUidwithUserid({ user_id })
    }

    @UseGuards(GqlAuthAccessGuard)
    @Mutation(() => PaymentTransaction)
    async createBasicPayment(
        @Args('impUid') impUid: string,
        @Args('amount') amount: number,
        @CurrentUser() currentUser: ICurrentUser,
    ) {
        const token = await this.iamportService.getToken();
        await this.iamportService.checkPaid({ impUid, amount, token });
        await this.paymentTransactionService.checkDuplicate({ impUid });
        await this.paymentTransactionService.createTransaction({ impUid, amount, currentUser });
        
        await this.userRepository.save({
            user_id: currentUser.user_id,
            SubsHistory: 1,
            isSubs: SUB_TYPE.BASIC,
            startDate: String(getToday()),
            endDate:String(oneMonthLater()) ,
        })
        const user_id = currentUser.user_id
        return this.paymentTransactionService.fetchimpUidwithUserid({ user_id })
    }

    @UseGuards(GqlAuthAccessGuard)
    @Mutation(() => PaymentTransaction)
    async createPremiumPayment(
        @Args('impUid') impUid: string,
        @Args('amount') amount: number,
        @CurrentUser() currentUser: ICurrentUser,
    ) {
        const token = await this.iamportService.getToken();
        await this.iamportService.checkPaid({ impUid, amount, token });
        await this.paymentTransactionService.checkDuplicate({ impUid });
        await this.paymentTransactionService.createTransaction({ impUid, amount, currentUser });
        
        await this.userRepository.save({
            user_id: currentUser.user_id,
            SubsHistory: 1,
            isSubs: SUB_TYPE.PREMIUM,
            startDate: String(getToday()),
            endDate:String(oneMonthLater()) 
        })
        const user_id = currentUser.user_id
        return this.paymentTransactionService.fetchimpUidwithUserid({ user_id })
    }

    @UseGuards(GqlAuthAccessGuard)
    @Mutation(() => PaymentTransaction)
    async cancelPaymentTransaction(
        @Args('impUid') impUid: string,
        @CurrentUser() currentUser: ICurrentUser,
    ) {
        await this.paymentTransactionService.checkAlreadyCanceled({ impUid });
        await this.paymentTransactionService.checkHasCancelableStatus({ impUid, currentUser });
        const token = await this.iamportService.getToken();
        const cancelAmount = await this.iamportService.cancel({ impUid,token });
        
        return await this.paymentTransactionService.cancelTransaction({
            impUid,
            amount: cancelAmount,
            currentUser,
        });
    }
}
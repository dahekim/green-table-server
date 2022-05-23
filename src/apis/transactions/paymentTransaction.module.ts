import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { IamportService } from "../iamport/iamport.service";
import { User } from "../user/entities/user.entity";
import { PaymentTransaction } from "./entities/paymentTransaction.entity";
import { PaymentTransactionService } from "./paymentTransaction.service";
import { PaymentTransactionResolver } from "./paymentTransaction.resolver";



@Module({
    imports: [
        TypeOrmModule.forFeature([
            PaymentTransaction,
            User,
        ]),
    ],
    providers: [
        PaymentTransactionResolver,
        PaymentTransactionService,
        IamportService
    ],
})
export class PaymentTransactionModule { }
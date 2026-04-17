import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CommissionsController } from './commissions.controller';
import { CommissionsService } from './commissions.service';
import { Commission, CommissionSchema } from './schemas/commission.schema';
import {
  Transaction,
  TransactionSchema,
} from '../transactions/schemas/transaction.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Commission.name, schema: CommissionSchema },
      { name: Transaction.name, schema: TransactionSchema },
    ]),
  ],
  controllers: [CommissionsController],
  providers: [CommissionsService],
  exports: [CommissionsService],
})
export class CommissionsModule {}

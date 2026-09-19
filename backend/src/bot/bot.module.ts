import { Module } from '@nestjs/common';
import { BotUpdate } from './bot.update';
import { UserModule } from '../user/user.module';

@Module({
    providers: [BotUpdate],
    imports: [UserModule]
})
export class BotModule {}

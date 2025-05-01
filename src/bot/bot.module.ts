import { Module } from '@nestjs/common';
import { TelegrafModule } from 'nestjs-telegraf';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { session } from 'telegraf';
import { BotUpdate } from './bot.update';
import { BotService } from './bot.service';
import { UsersModule } from '../users/users.module';
import { ChatModule } from '../chat/chat.module';
import { MatchingModule } from '../matching/matching.module';
import { FindChatScene } from './scenes/find-chat.scene';
import { ReportScene } from './scenes/report.scene';

@Module({
  imports: [
    TelegrafModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const token = configService.get('telegramBotToken');
        return {
          token,
          include: [BotModule],
          middlewares: [session()],
        };
      },
    }),
    UsersModule,
    ChatModule,
    MatchingModule,
  ],
  providers: [BotUpdate, BotService, FindChatScene, ReportScene],
})
export class BotModule {}

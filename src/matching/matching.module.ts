import { Module } from '@nestjs/common';
import { MatchingService } from './matching.service';
import { UsersModule } from '../users/users.module';
import { ChatModule } from '../chat/chat.module';

@Module({
  imports: [UsersModule, ChatModule],
  providers: [MatchingService],
  exports: [MatchingService],
})
export class MatchingModule {}

import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { ChatService } from '../chat/chat.service';
import { UserStatus } from '../users/schemas/user.schema';
import { User } from '../users/schemas/user.schema';

@Injectable()
export class MatchingService {
  private searchingUsers: Map<number, Date> = new Map();

  constructor(
    private readonly usersService: UsersService,
    private readonly chatService: ChatService,
  ) {}

  async addToQueue(telegramId: number): Promise<boolean> {
    const user = await this.usersService.findByTelegramId(telegramId);
    
    if (!user || user.status === UserStatus.CHATTING) {
      return false;
    }

    await this.usersService.updateStatus(telegramId, UserStatus.SEARCHING);
    this.searchingUsers.set(telegramId, new Date());
    
    return true;
  }

  async removeFromQueue(telegramId: number): Promise<boolean> {
    if (!this.searchingUsers.has(telegramId)) {
      return false;
    }

    this.searchingUsers.delete(telegramId);
    await this.usersService.updateStatus(telegramId, UserStatus.IDLE);
    
    return true;
  }

  async findMatch(telegramId: number): Promise<User | null> {
    if (!this.searchingUsers.has(telegramId)) {
      return null;
    }

    const searchingUsers = Array.from(this.searchingUsers.entries())
      .filter(([id]) => id !== telegramId)
      .sort((a, b) => a[1].getTime() - b[1].getTime());

    if (searchingUsers.length === 0) {
      return null;
    }

    const [matchedId] = searchingUsers[0];
    
    this.searchingUsers.delete(telegramId);
    this.searchingUsers.delete(matchedId);
    
    return this.usersService.findByTelegramId(matchedId);
  }

  async createMatch(user1Id: number, user2Id: number): Promise<string> {
    const chat = await this.chatService.create({
      participants: [user1Id, user2Id],
    });

    await this.usersService.updateCurrentChat(user1Id, chat._id.toString());
    await this.usersService.updateCurrentChat(user2Id, chat._id.toString());

    return chat._id.toString();
  }

  getQueueLength(): number {
    return this.searchingUsers.size;
  }

  isUserInQueue(telegramId: number): boolean {
    return this.searchingUsers.has(telegramId);
  }
}

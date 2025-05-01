import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { ChatService } from '../chat/chat.service';
import { MatchingService } from '../matching/matching.service';
import { UserStatus } from '../users/schemas/user.schema';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { Message } from 'telegraf/typings/core/types/typegram';
import { BotContext } from './bot.update';

@Injectable()
export class BotService {
  constructor(
    private readonly usersService: UsersService,
    private readonly chatService: ChatService,
    private readonly matchingService: MatchingService,
  ) {}

  async handleStart(ctx: BotContext): Promise<string> {
    const telegramUser = ctx.from;
    let user = await this.usersService.findByTelegramId(telegramUser.id);

    if (!user) {
      const createUserDto: CreateUserDto = {
        telegramId: telegramUser.id,
        username: telegramUser.username,
        firstName: telegramUser.first_name,
        lastName: telegramUser.last_name,
      };

      user = await this.usersService.create(createUserDto);
    }

    return `Welcome to Strangers Chat Bot, ${user.firstName}!

Use /find to start searching for a chat partner.
Use /stop to end your current chat.
Use /help to see all available commands.`;
  }

  async handleHelp(): Promise<string> {
    return `Available commands:

/start - Start the bot
/help - Show this help message
/find - Find a stranger to chat with
/stop - End your current chat
/report - Report inappropriate behavior`;
  }

  async handleFind(ctx: BotContext): Promise<string> {
    const telegramId = ctx.from.id;
    const user = await this.usersService.findByTelegramId(telegramId);

    if (!user) {
      return 'Please use /start to register first.';
    }

    if (user.status === UserStatus.CHATTING) {
      return 'You are already in a chat. Use /stop to end it first.';
    }

    if (user.status === UserStatus.SEARCHING) {
      return 'You are already searching for a chat partner. Please wait...';
    }

    await this.matchingService.addToQueue(telegramId);
    const match = await this.matchingService.findMatch(telegramId);

    if (!match) {
      return 'Looking for a chat partner... Please wait.';
    }

    const chatId = await this.matchingService.createMatch(telegramId, match.telegramId);

    await ctx.telegram.sendMessage(
      match.telegramId,
      'You have been matched with a stranger! You can now start chatting.',
    );

    return 'You have been matched with a stranger! You can now start chatting.';
  }

  async handleStop(ctx: BotContext): Promise<string> {
    const telegramId = ctx.from.id;
    const user = await this.usersService.findByTelegramId(telegramId);

    if (!user) {
      return 'Please use /start to register first.';
    }

    if (user.status === UserStatus.SEARCHING) {
      await this.matchingService.removeFromQueue(telegramId);
      return 'You are no longer searching for a chat partner.';
    }

    if (user.status !== UserStatus.CHATTING || !user.currentChatId) {
      return 'You are not in a chat.';
    }

    const chat = await this.chatService.findById(user.currentChatId);
    if (!chat) {
      await this.usersService.clearCurrentChat(telegramId);
      return 'Chat not found. Your status has been reset.';
    }

    const otherParticipantId = await this.chatService.getOtherParticipant(
      user.currentChatId,
      telegramId,
    );

    await this.chatService.endChat(user.currentChatId);
    await this.usersService.clearCurrentChat(telegramId);

    if (otherParticipantId) {
      await this.usersService.clearCurrentChat(otherParticipantId);
      await ctx.telegram.sendMessage(
        otherParticipantId,
        'Your chat partner has ended the conversation. Use /find to start a new chat.',
      );
    }

    return 'Chat ended. Use /find to start a new chat.';
  }

  async handleMessage(ctx: BotContext): Promise<void> {
    if (!ctx.message || !('text' in ctx.message)) {
      return;
    }

    const telegramId = ctx.from.id;
    const messageText = (ctx.message as Message.TextMessage).text;

    const user = await this.usersService.findByTelegramId(telegramId);

    if (!user || user.status !== UserStatus.CHATTING || !user.currentChatId) {
      return;
    }

    const chat = await this.chatService.findById(user.currentChatId);
    if (!chat) {
      await this.usersService.clearCurrentChat(telegramId);
      await ctx.reply('Chat not found. Your status has been reset. Use /find to start a new chat.');
      return;
    }

    const otherParticipantId = await this.chatService.getOtherParticipant(
      user.currentChatId,
      telegramId,
    );

    if (!otherParticipantId) {
      await this.usersService.clearCurrentChat(telegramId);
      await ctx.reply('Your chat partner is no longer available. Use /find to start a new chat.');
      return;
    }

    await this.chatService.addMessage(user.currentChatId, {
      sender: telegramId,
      text: messageText,
    });

    await ctx.telegram.sendMessage(otherParticipantId, messageText);
  }
}

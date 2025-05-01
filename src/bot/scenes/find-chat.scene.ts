import { Action, Ctx, Scene, SceneEnter } from 'nestjs-telegraf';
import { Markup, Scenes } from 'telegraf';
import { MatchingService } from '../../matching/matching.service';
import { UsersService } from '../../users/users.service';
import { UserStatus } from '../../users/schemas/user.schema';

type FindChatContext = Scenes.SceneContext;

@Scene('find-chat')
export class FindChatScene {
  constructor(
    private readonly matchingService: MatchingService,
    private readonly usersService: UsersService,
  ) {}

  @SceneEnter()
  async enter(@Ctx() ctx: FindChatContext) {
    const telegramId = ctx.from.id;
    const user = await this.usersService.findByTelegramId(telegramId);

    if (!user) {
      await ctx.reply('Please use /start to register first.');
      await ctx.scene.leave();
    }

    if (user.status === UserStatus.CHATTING) {
      await ctx.reply('You are already in a chat. Use /stop to end it first.');
      await ctx.scene.leave();
    }

    if (user.status === UserStatus.SEARCHING) {
      await ctx.reply(
        'You are already searching for a chat partner. Would you like to cancel?',
        Markup.inlineKeyboard([
          Markup.button.callback('Cancel Search', 'cancel_search'),
          Markup.button.callback('Continue Searching', 'continue_search'),
        ]),
      );
      return;
    }

    await this.matchingService.addToQueue(telegramId);

    await ctx.reply(
      'Looking for a chat partner... Please wait or press Cancel to stop searching.',
      Markup.inlineKeyboard([
        Markup.button.callback('Cancel', 'cancel_search'),
      ]),
    );

    const match = await this.matchingService.findMatch(telegramId);

    if (!match) {
      return;
    }

    const chatId = await this.matchingService.createMatch(
      telegramId,
      match.telegramId,
    );

    await ctx.telegram.sendMessage(
      match.telegramId,
      'You have been matched with a stranger! You can now start chatting.',
    );

    await ctx.reply(
      'You have been matched with a stranger! You can now start chatting.',
    );
    await ctx.scene.leave();
  }

  @Action('cancel_search')
  async cancelSearch(@Ctx() ctx: FindChatContext) {
    const telegramId = ctx.from.id;
    await this.matchingService.removeFromQueue(telegramId);
    await ctx.editMessageText('Search cancelled. Use /find to search again.');
    await ctx.scene.leave();
  }

  @Action('continue_search')
  async continueSearch(@Ctx() ctx: FindChatContext) {
    await ctx.editMessageText('Continuing to search for a chat partner...');
    return;
  }
}

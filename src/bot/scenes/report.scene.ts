import { Ctx, Message, On, Scene, SceneEnter } from 'nestjs-telegraf';
import { UsersService } from '../../users/users.service';
import { ChatService } from '../../chat/chat.service';
import { UserStatus } from '../../users/schemas/user.schema';
import { Scenes } from 'telegraf';

type ReportContext = Scenes.SceneContext;

@Scene('report')
export class ReportScene {
  constructor(
    private readonly usersService: UsersService,
    private readonly chatService: ChatService,
  ) {}

  @SceneEnter()
  async enter(@Ctx() ctx: ReportContext) {
    const telegramId = ctx.from.id;
    const user = await this.usersService.findByTelegramId(telegramId);

    if (!user) {
      await ctx.reply('Please use /start to register first.');
      await ctx.scene.leave();
    }

    if (user.status !== UserStatus.CHATTING || !user.currentChatId) {
      await ctx.reply(
        'You are not in a chat. You can only report users you are chatting with.',
      );
      await ctx.scene.leave();
    }

    await ctx.reply('Please describe the issue you want to report:');
  }

  @On('text')
  async onMessage(
    @Message('text') reportText: string,
    @Ctx() ctx: ReportContext,
  ) {
    const telegramId = ctx.from.id;
    const user = await this.usersService.findByTelegramId(telegramId);

    if (!user || user.status !== UserStatus.CHATTING || !user.currentChatId) {
      await ctx.reply('You are not in a chat. Report cancelled.');
      await ctx.scene.leave();
    }

    const otherParticipantId = await this.chatService.getOtherParticipant(
      user.currentChatId,
      telegramId,
    );

    await ctx.reply(
      'Thank you for your report. We will review it as soon as possible.',
    );

    // In a real application, you would store this report in a database
    // and have an admin interface to review reports
    console.log(
      `Report from ${telegramId} about ${otherParticipantId}: ${reportText}`,
    );

    await ctx.scene.leave();
  }
}

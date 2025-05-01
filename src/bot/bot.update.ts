import {
  Ctx,
  Hears,
  Help,
  InjectBot,
  Message,
  On,
  Start,
  Update,
} from 'nestjs-telegraf';
import { Context, Scenes, Telegraf, session } from "telegraf";
import { BotService } from './bot.service';

export interface BotContext extends Context {
  scene: Scenes.SceneContext;
  session: any;
}

@Update()
export class BotUpdate {
  constructor(
    @InjectBot() private readonly bot: Telegraf<BotContext>,
    private readonly botService: BotService,
  ) {}

  @Start()
  async start(@Ctx() ctx: BotContext) {
    const message = await this.botService.handleStart(ctx);
    await ctx.reply(message);
  }

  @Help()
  async help(@Ctx() ctx: BotContext) {
    const message = await this.botService.handleHelp();
    await ctx.reply(message);
  }

  @Hears('/find')
  async find(@Ctx() ctx: BotContext) {
    const message = await this.botService.handleFind(ctx);
    await ctx.reply(message);
  }

  @Hears('/stop')
  async stop(@Ctx() ctx: BotContext) {
    const message = await this.botService.handleStop(ctx);
    await ctx.reply(message);
  }

  @Hears('/report')
  async report(@Ctx() ctx: Scenes.SceneContext) {
    await ctx.scene.enter('report');
  }

  @On('message')
  async onMessage(@Message('text') message: string, @Ctx() ctx: BotContext) {
    if (message && message.startsWith('/')) {
      return;
    }

    await this.botService.handleMessage(ctx);
  }
}

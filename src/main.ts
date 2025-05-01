import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Log important configuration for debugging
  const botToken = configService.get('telegramBotToken');
  if (!botToken) {
    console.error('TELEGRAM_BOT_TOKEN is not set in .env file');
    process.exit(1);
  }

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application is running on port ${port}`);
}
bootstrap();

export default () => ({
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN,
  database: {
    uri: process.env.MONGODB_URI,
  },
});

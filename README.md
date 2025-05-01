# Strangers Chat Telegram Bot

A Telegram bot for matching strangers and tunneling messages between them, built with NestJS, Telegraf, and MongoDB.

## Features

- User registration and management
- Matching system for connecting strangers
- Real-time chat between matched users
- Chat termination and reporting functionality
- MongoDB integration for data persistence

## Tech Stack

- NestJS - A progressive Node.js framework
- Telegraf - Modern Telegram Bot API framework
- nestjs-telegraf - NestJS module for Telegraf integration
- MongoDB - NoSQL database
- Mongoose - MongoDB object modeling for Node.js

## Project Structure

```
src/
├── config/
│   └── configuration.ts
├── database/
│   └── database.module.ts
├── bot/
│   ├── bot.module.ts
│   ├── bot.update.ts
│   ├── bot.service.ts
│   └── scenes/
│       ├── find-chat.scene.ts
│       └── report.scene.ts
├── users/
│   ├── users.module.ts
│   ├── users.service.ts
│   └── schemas/
│       └── user.schema.ts
├── chat/
│   ├── chat.module.ts
│   ├── chat.service.ts
│   └── schemas/
│       └── chat.schema.ts
├── matching/
│   ├── matching.module.ts
│   └── matching.service.ts
├── app.module.ts
└── main.ts
```

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- Yarn package manager
- MongoDB instance (local or cloud)
- Telegram Bot Token (from BotFather)

### Installation

1. Clone the repository

```bash
git clone https://github.com/monokaijs/strangers-chat.git
cd strangers-chat
```

2. Install dependencies

```bash
yarn install
```

3. Configure environment variables

Create a `.env` file in the root directory with the following variables:

```
TELEGRAM_BOT_TOKEN=your_bot_token_here
MONGODB_URI=mongodb://localhost:27017/strangers-chat
```

### Running the Application

```bash
# development
yarn start

# watch mode
yarn start:dev

# production mode
yarn start:prod
```

## Bot Commands

- `/start` - Start the bot and register the user
- `/help` - Display available commands
- `/find` - Find a stranger to chat with
- `/stop` - End the current chat
- `/report` - Report inappropriate behavior

## Development

### Adding New Features

1. Create new modules using NestJS CLI

```bash
nest generate module new-feature
nest generate service new-feature
```

2. Implement the feature in the created files
3. Import the module in the app.module.ts file

## Deployment

### Traditional Deployment

1. Build the application

```bash
yarn build
```

2. Set up environment variables on your server
3. Run the application using a process manager like PM2

```bash
pm2 start dist/main.js
```

### Docker Deployment

#### Using Local Docker Compose

1. Make sure your `.env` file contains your Telegram bot token
2. Run the Docker setup:

```bash
./docker-start.sh
```

#### Using GitHub Container Registry

This project is automatically built and published to GitHub Container Registry on every push to the main branch.

1. Pull the latest image:

```bash
docker pull ghcr.io/YOUR_GITHUB_USERNAME/strangers-chat:latest
```

2. Create a docker-compose.yml file:

```yaml
version: '3.8'

services:
  app:
    image: ghcr.io/YOUR_GITHUB_USERNAME/strangers-chat:latest
    container_name: strangers-chat-bot
    restart: always
    environment:
      - NODE_ENV=production
      - TELEGRAM_BOT_TOKEN=your_bot_token_here
      - MONGODB_URI=mongodb://mongodb:27017/strangers-chat
    depends_on:
      - mongodb

  mongodb:
    image: mongo:latest
    container_name: mongodb
    restart: always
    volumes:
      - mongodb_data:/data/db

volumes:
  mongodb_data:
    driver: local
```

3. Run the containers:

```bash
docker-compose up -d
```

## License

This project is licensed under the MIT License.

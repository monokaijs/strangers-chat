import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Chat, ChatDocument, ChatStatus } from './schemas/chat.schema';
import { CreateChatDto } from './dto/create-chat.dto';
import { AddMessageDto } from './dto/add-message.dto';

@Injectable()
export class ChatService {
  constructor(@InjectModel(Chat.name) private chatModel: Model<ChatDocument>) {}

  async create(createChatDto: CreateChatDto): Promise<Chat> {
    const createdChat = new this.chatModel(createChatDto);
    return createdChat.save();
  }

  async findById(id: string): Promise<Chat> {
    return this.chatModel.findById(id).exec();
  }

  async findByParticipant(telegramId: number): Promise<Chat> {
    return this.chatModel
      .findOne({
        participants: telegramId,
        status: ChatStatus.ACTIVE,
      })
      .exec();
  }

  async addMessage(
    chatId: string,
    addMessageDto: AddMessageDto,
  ): Promise<Chat> {
    return this.chatModel
      .findByIdAndUpdate(
        chatId,
        { $push: { messages: addMessageDto } },
        { new: true },
      )
      .exec();
  }

  async endChat(chatId: string): Promise<Chat> {
    return this.chatModel
      .findByIdAndUpdate(
        chatId,
        { status: ChatStatus.ENDED, endedAt: new Date() },
        { new: true },
      )
      .exec();
  }

  async getOtherParticipant(
    chatId: string,
    telegramId: number,
  ): Promise<number> {
    const chat = await this.chatModel.findById(chatId).exec();
    if (!chat) return null;

    return chat.participants.find((id) => id !== telegramId);
  }
}

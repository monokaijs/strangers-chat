import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument, UserStatus } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const createdUser = new this.userModel(createUserDto);
    return createdUser.save();
  }

  async findByTelegramId(telegramId: number): Promise<User> {
    return this.userModel.findOne({ telegramId }).exec();
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  async updateStatus(telegramId: number, status: UserStatus): Promise<User> {
    return this.userModel.findOneAndUpdate(
      { telegramId },
      { status, lastActive: new Date() },
      { new: true },
    ).exec();
  }

  async updateCurrentChat(telegramId: number, chatId: string): Promise<User> {
    return this.userModel.findOneAndUpdate(
      { telegramId },
      { currentChatId: chatId, status: UserStatus.CHATTING, lastActive: new Date() },
      { new: true },
    ).exec();
  }

  async clearCurrentChat(telegramId: number): Promise<User> {
    return this.userModel.findOneAndUpdate(
      { telegramId },
      { currentChatId: null, status: UserStatus.IDLE, lastActive: new Date() },
      { new: true },
    ).exec();
  }

  async findUsersWithStatus(status: UserStatus): Promise<User[]> {
    return this.userModel.find({ status }).exec();
  }
}

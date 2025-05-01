import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum UserStatus {
  IDLE = 'idle',
  SEARCHING = 'searching',
  CHATTING = 'chatting',
}

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  _id: Types.ObjectId;

  @Prop({ required: true, unique: true })
  telegramId: number;

  @Prop()
  username: string;

  @Prop({ required: true })
  firstName: string;

  @Prop()
  lastName: string;

  @Prop({ default: UserStatus.IDLE })
  status: UserStatus;

  @Prop()
  currentChatId: string;

  @Prop({ default: Date.now })
  lastActive: Date;

  @Prop({ type: Object })
  preferences: {
    language?: string;
    topics?: string[];
  };
}

export const UserSchema = SchemaFactory.createForClass(User);

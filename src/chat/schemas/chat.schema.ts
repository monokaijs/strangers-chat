import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum ChatStatus {
  ACTIVE = 'active',
  ENDED = 'ended',
}

export type ChatDocument = Chat & Document;

@Schema()
export class Message {
  @Prop({ required: true })
  sender: number;

  @Prop({ required: true })
  text: string;

  @Prop({ default: Date.now })
  timestamp: Date;
}

@Schema({ timestamps: true })
export class Chat {
  _id: Types.ObjectId;

  @Prop({ required: true, type: [Number] })
  participants: number[];

  @Prop({ default: ChatStatus.ACTIVE })
  status: ChatStatus;

  @Prop({ default: Date.now })
  startedAt: Date;

  @Prop()
  endedAt: Date;

  @Prop({ type: [Message], default: [] })
  messages: Message[];
}

export const ChatSchema = SchemaFactory.createForClass(Chat);

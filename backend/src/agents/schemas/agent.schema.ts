import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export type AgentDocument = HydratedDocument<Agent>;

@Schema({ timestamps: true })
export class Agent {
  @ApiProperty({ example: 'John' })
  @Prop({ required: true, trim: true })
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @Prop({ required: true, trim: true })
  lastName: string;

  @ApiProperty({ example: 'john.doe@agency.com' })
  @Prop({ required: true, lowercase: true, trim: true })
  email: string;

  @ApiPropertyOptional({ example: '+34 612 345 678' })
  @Prop({ trim: true })
  phone?: string;

  @ApiProperty({ example: true })
  @Prop({ default: true })
  isActive: boolean;
}

export const AgentSchema = SchemaFactory.createForClass(Agent);

AgentSchema.index({ email: 1 }, { unique: true });
AgentSchema.index({ isActive: 1 });

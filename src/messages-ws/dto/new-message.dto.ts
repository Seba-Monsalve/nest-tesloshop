import { IsString } from 'class-validator';

export class NewMessageDto {
  @IsString()
  id: string;
  @IsString()
  message: string;
}

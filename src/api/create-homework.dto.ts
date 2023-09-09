import { IsDateString, IsString } from 'class-validator';

export class createHomeworkDto {
  @IsString()
  subject: string;

  @IsString()
  teacher: string;

  @IsString()
  text: string;

  @IsDateString()
  dateDue: Date;
}

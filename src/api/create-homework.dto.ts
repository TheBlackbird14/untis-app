import { IsDateString, IsNotEmpty, IsString } from 'class-validator';

export class createHomeworkDto {
  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsNotEmpty()
  @IsString()
  teacher: string;

  @IsString()
  text: string;

  @IsDateString()
  @IsNotEmpty()
  dateDue: Date;
}

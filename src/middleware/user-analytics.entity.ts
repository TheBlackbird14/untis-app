import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { IsDate, IsNotEmpty, IsString } from 'class-validator';

@Entity()
export class UserAnalytics {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @IsString()
  @IsNotEmpty()
  username: string;

  @Column({ nullable: true })
  @IsDate()
  last_get: Date;

  @Column({ nullable: true })
  @IsDate()
  last_edit: Date;

  @Column({ nullable: true })
  @IsDate()
  last_create: Date;

  @Column({ nullable: true })
  @IsDate()
  last_delete: Date;
}

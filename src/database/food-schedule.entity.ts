import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { IsDate } from 'class-validator';

@Entity()
export class FoodSchedule {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  text: string;

  @Column()
  @IsDate()
  date: Date;

  @Column('int', { array: true, nullable: true })
  probability: number[];
}

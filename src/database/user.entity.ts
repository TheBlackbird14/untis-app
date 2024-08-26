import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class UntisUser {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column({ nullable: true })
  key: string;

  @Column({ nullable: true })
  iv: string;
}

import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class HomeworkState {
    @PrimaryGeneratedColumn()
    id: string;

    @Column()
    userId: number

    @Column()
    homeworkId: number

    @Column()
    completed: boolean
}

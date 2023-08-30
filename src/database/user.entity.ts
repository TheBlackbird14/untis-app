import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class UntisUser {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    username: string

}
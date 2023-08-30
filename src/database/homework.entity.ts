import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
export class Homework {

    @PrimaryColumn()
    id: number;

    @Column()
    dateAdded: Date;

    @Column()
    dateDue: Date;

    @Column()
    text: string;

    @Column()
    remark?: string;

    @Column()
    teacher: string;

    @Column()
    subject: string;

    @Column("int", { array: true, nullable: false, default: [] })
    students: number[] = []
}
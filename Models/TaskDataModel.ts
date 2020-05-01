import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('tasks')
export class TaskDataModel {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'varchar', length: 32 })
    getterId: string;

    @Column({ type: 'varchar', length: 32 })
    senderId: string;

    @Column({ type: 'varchar', length: 32 })
    trelloListId: string;

    @Column({ type: 'varchar', length: 32 })
    trelloCardId: string;

    @Column({ type: 'boolean' })
    isEnded: boolean;

}
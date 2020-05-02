import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export class UserDataModel {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'varchar', length: 32 })
    userId: string;

    @Column({ type: 'varchar', length: 32 })
    trelloListId: string;

    @Column({ type: 'int', nullable: true })
    coins: number;

}
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export class UserDataModel {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'varchar', length: 32 })
    userId: string;

    @Column({ type: 'int', nullable: false })
    coins: number;

}
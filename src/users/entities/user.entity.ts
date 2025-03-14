import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export enum UserRole {
  user = 'user',
  admin = 'admin',
  PremiumUser = 'premium',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column()
  password: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.user })
  role: UserRole;
}

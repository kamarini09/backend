import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { Role } from '../roles.enum';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.USER, // ✅ Default to 'user'
  })
  role: Role;
}

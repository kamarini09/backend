import { IsString, IsNotEmpty, MinLength, IsEnum } from 'class-validator';
import { Role } from '../roles.enum';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(4)
  password: string;

  @IsEnum(Role, { message: 'role must be either user, premium, or admin' }) // ✅ Restrict roles
  role: Role;
}

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('users')
@UseGuards(JwtAuthGuard) // Apply JWT guard globally to all routes (except @Post)
export class UserController {
  constructor(private readonly userService: UsersService) {}

  // ✅ Public route - Anyone can create a user
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  // ✅ Protected route - Authenticated users can get all users
  @Get()
  findAll() {
    return this.userService.findAll();
  }

  // ✅ Protected route - Users can view their own profile
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }

  // ✅ Protected route - Only authenticated users can get user info
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  // ✅ Protected route - Only authenticated users can update their profile
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  // ✅ Protected route - Only authenticated users can delete their account
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}

import { Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { Repository } from 'typeorm';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  create(createCategoryDto: CreateCategoryDto) {
    //i need to not allow categories that only have uppercase difference go throught
    //to check if the category already exists
    return this.categoryRepository.save(createCategoryDto);
  }

  // isAdult(age: number): boolean {
  //    if(age < 0) {
  //      throw new Error('Age cannot be negative')
  //  }
  //   return age > 18;
  // }

  findAll() {
    return this.categoryRepository.find({});
  }

  findOne(id: number) {
    return `This action returns a #${id} category`;
  }

  update(id: number, updateCategoryDto: UpdateCategoryDto) {
    return `This action updates a #${id} category`;
  }

  remove(id: number) {
    return this.categoryRepository.delete(id);
  }
}

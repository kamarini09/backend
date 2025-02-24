import { Category } from 'src/categories/entities/category.entity';

export class CreateEntryDto {
  id: number;
  title: string;
  amount: number;
  category: Category;
}

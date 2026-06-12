import { IsArray } from "class-validator";

export class AddCategoriesDto {
  @IsArray()
  categoryName!: string;
}
import { IsArray } from "class-validator";

export class AddUsersDto {
  @IsArray()
  userIds!: string[];
}
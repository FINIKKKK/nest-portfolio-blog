import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';

export type OutputBlockData = {
  id?: number;
  type: any;
  data: any;
};

export class CreatePostDto {
  @IsString()
  title: string;

  @IsArray()
  body: OutputBlockData[];

  @IsNumber()
  categoryId: number;
}

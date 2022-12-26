import { IsNotEmpty } from "class-validator";

export class CreateCommentDto {
  @IsNotEmpty()
  text: string;

  @IsNotEmpty()
  postId: number;

  parentId?: number;

  parentUserId?: number;
}

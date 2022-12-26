import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createQueryBuilder, Repository } from 'typeorm';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CommentEntity } from './entities/comment.entity';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(CommentEntity)
    private repository: Repository<CommentEntity>,
  ) {}

  async create(dto: CreateCommentDto, userId: number) {
    const comment = await this.repository.save({
      text: dto.text,
      post: { id: dto.postId },
      user: {
        id: userId,
      },
      parent: { id: dto.parentId },
      parentUser: { id: dto.parentUserId },
    });

    return this.repository.findOne({
      where: { id: comment.id },
      relations: ['post', 'user', 'parent', 'parentUser'],
    });
  }

  async findAll(postId: number) {
    const qb = await this.repository.createQueryBuilder('comments');

    const arr = await qb
      .where('comments.post = :postId', { postId })
      .orderBy('comments.createdAt', 'DESC')
      .leftJoinAndSelect('comments.post', 'post')
      .leftJoinAndSelect('comments.user', 'user')
      .leftJoinAndSelect('comments.parent', 'parent')
      .leftJoinAndSelect('comments.parentUser', 'parentUser')
      .leftJoinAndSelect('comments.children', 'children')
      .leftJoinAndSelect('children.user', 'children_user')
      .leftJoinAndSelect('children.parentUser', 'parentUser_user')
      .getMany();

    const processChildren = (parent: any) => {
      return parent.children
        .sort((a, b) => b.createdAt - a.createdAt)
        .map((obj) => {
          return {
            ...obj,
            user: { id: obj.user.id, name: obj.user.name },
            parentUser: { id: obj.parentUser.id, name: obj.parentUser.name },
          };
        });
    };

    return (
      arr
        .filter((obj) => obj.parent === null)
        .map((obj) => {
          return {
            ...obj,
            post: { id: obj.post.id, title: obj.post.title },
            user: { id: obj.user.id, name: obj.user.name },
            children: processChildren(obj),
          };
        })
    );
  }

  findOne(id: number) {
    return this.repository.findOne({ where: { id } });
  }

  update(id: number, dto: UpdateCommentDto) {
    return this.repository.update(id, dto);
  }

  deleteCommentsByPostId(postId: number) {
    this.repository.delete({ post: { id: postId } });
  }

  remove(id: number) {
    return this.repository.delete(id);
  }
}

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
    });

    return this.repository.findOne({
      where: { id: comment.id },
      relations: ['user'],
    });
  }

  async findAll(postId: number) {
    const arr = await this.repository
      .createQueryBuilder('comments')
      .where('comments.post = :postId', { postId })
      .orderBy('comments.createdAt', 'DESC')
      .leftJoinAndSelect('comments.post', 'post')
      .leftJoinAndSelect('comments.user', 'user')
      .getMany();

    return arr.map((obj) => {
      return {
        ...obj,
        post: { id: obj.post.id, title: obj.post.title },
        user: { id: obj.user.id, name: obj.user.name },
      };
    });
  }

  findOne(id: number) {
    return this.repository.findOne({ where: { id } });
  }

  update(id: number, dto: UpdateCommentDto) {
    return this.repository.update(id, dto);
  }

  async removeAllOnPost(postId: number) {
    const arr = await this.repository
      .createQueryBuilder('comments')
      .where('comments.post = :postId', { postId })
      .getMany();

    return arr.map((obj) => {
      this.repository.delete(obj.id);
    });
  }

  remove(id: number) {
    return this.repository.delete(id);
  }
}

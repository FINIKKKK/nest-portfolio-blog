import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CommentEntity } from 'src/comments/entities/comment.entity';
import { FindOneOptions, Repository } from 'typeorm';
import { CreatePostDto } from './dto/create-post.dto';
import { SearchPostDto } from './dto/search-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostEntity } from './entities/post.entity';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(PostEntity)
    private repository: Repository<PostEntity>,
  ) {}

  async create(dto: CreatePostDto, userId: number) {
    const firstPatagraph = dto.body.find((obj) => obj.type === 'paragraph')
      ?.data?.text;

    const post = await this.repository.save({
      title: dto.title,
      category: { id: dto.categoryId },
      body: dto.body,
      description: firstPatagraph || '',
      user: { id: userId },
    });

    return this.repository.findOne({
      where: { id: post.id },
      relations: ['user', 'category'],
    });
  }

  async findAll(dto: { limit?: number; page?: number; categoryId?: number }) {
    const limit = dto.limit || 3;
    const page = dto.page || 1;
    const qb = await this.repository.createQueryBuilder('p');

    if (dto.categoryId) {
      qb.where({ category: { id: dto.categoryId } });
    }

    const [items, total] = await qb
      .orderBy('p.createdAt', 'DESC')
      .leftJoinAndSelect('p.category', 'category')
      .leftJoinAndSelect('p.user', 'user')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const posts = items.map((obj) => {
      return {
        ...obj,
        category: { id: obj.category.id, name: obj.category.name },
        user: { id: obj.user.id, name: obj.user.name },
      };
    });

    return {
      total,
      posts,
    };
  }

  async search(dto: SearchPostDto) {
    const qb = this.repository.createQueryBuilder('p');

    qb.leftJoinAndSelect('p.user', 'user');
    qb.leftJoinAndSelect('p.category', 'category');

    qb.limit(dto.limit || 0);
    qb.take(dto.take || 10);

    if (dto.views) {
      qb.orderBy('views', dto.views);
    }

    if (dto.body) {
      qb.andWhere(`p.body ILIKE :body`);
    }

    if (dto.title) {
      qb.andWhere(`p.title ILIKE :title`);
    }

    if (dto.category) {
      qb.andWhere(`p.category ILIKE :category`);
    }

    qb.setParameters({
      title: `%${dto.title}%`,
      body: `%${dto.body}%`,
      category: `%${dto.category}%`,
      views: dto.views || '',
    });

    const [items, total] = await qb.getManyAndCount();

    return { items, total };
  }

  async findOne(id: number) {
    await this.repository
      .createQueryBuilder('posts')
      .whereInIds(id)
      .update()
      .set({
        views: () => 'views + 1',
      })
      .execute();

    const post = await this.repository
      .createQueryBuilder('posts')
      .whereInIds(id)
      .leftJoinAndSelect('posts.category', 'category')
      .leftJoinAndSelect('posts.user', 'user')
      .getOne();

    return {
      ...post,
      category: { id: post.category.id, name: post.category.name },
      user: { id: post.user.id, name: post.user.name },
    };
  }

  async update(id: number, dto: UpdatePostDto, userId: number) {
    const find = await this.repository.update(id, dto);
    if (!find) {
      throw new NotFoundException();
    }

    const firstPatagraph = dto.body.find((obj) => obj.type === 'paragraph')?.data?.text;
    return this.repository.update(id, {
      title: dto.title,
      body: dto.body,
      description: firstPatagraph || '',
      // @ts-ignore
      category: { id: dto.category },
      user: { id: userId },
    });
  }

  async remove(id: number, userId: number) {
    return this.repository.delete(id);
  }
}

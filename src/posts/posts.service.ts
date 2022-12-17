import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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

  create(dto: CreatePostDto, userId: number) {
    const firstPatagraph = dto.body.find((obj) => obj.type === 'paragraph')
      ?.data?.text;

    return this.repository.save({
      title: dto.title,
      body: dto.body,
      description: firstPatagraph || '',
      author: { id: userId },
    });
  }

  findAll() {
    return this.repository.find({
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async popular() {
    const qb = this.repository.createQueryBuilder();

    qb.orderBy('views', 'DESC');
    qb.limit(10);

    const [items, total] = await qb.getManyAndCount();

    return {
      items,
      total,
    };
  }

  async search(dto: SearchPostDto) {
    const qb = this.repository.createQueryBuilder('p');

    qb.limit(dto.limit || 0);
    qb.take(dto.take || 10);

    if (dto.views) {
      qb.orderBy('views', dto.views);
    }

    if (dto.body) {
      qb.andWhere(`p.body ILIKE :title `);
    }

    if (dto.title) {
      qb.andWhere(`p.title ILIKE :body `);
    }

    qb.setParameters({
      title: `%${dto.title}% `,
      body: `%${dto.body}% `,
      views: dto.views,
    });

    const [items, total] = await qb.getManyAndCount();

    return {
      items,
      total,
    };
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

    return this.repository.findOne({
      where: {
        id,
      },
    });
  }

  async update(id: number, dto: UpdatePostDto, userId: number) {
    const find = await this.repository.update(id, dto);

    if (!find) {
      throw new NotFoundException();
    }

    const firstPatagraph = dto.body.find((obj) => obj.type === 'paragraph')
      ?.data?.text;

    return this.repository.update(id, {
      title: dto.title,
      body: dto.body,
      description: firstPatagraph || '',
      user: { id: userId },
    });
  }

  async remove(id: number, userId: number) {
    const find = await this.repository.delete(id);

    if (!find) {
      throw new NotFoundException('Статья не найдена');
    }

    return find;
  }
}

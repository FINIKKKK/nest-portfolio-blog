import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { PostsModule } from './posts/posts.module';
import { CommentsModule } from './comments/comments.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostEntity } from './posts/entities/post.entity';
import { AuthModule } from './auth/auth.module';
import { UserEntity } from './users/entities/user.entity';
import { LocalStrategy } from './auth/stategies/local.stategy';
import { CommentEntity } from './comments/entities/comment.entity';
import { CategoriesModule } from './categories/categories.module';
import { CategoryEntity } from './categories/entities/category.entity';


@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: '1036845297',
      database: 'portfolio-blog',
      entities: [PostEntity, UserEntity, CommentEntity, CategoryEntity],
      synchronize: true,
    }),
    UsersModule,
    PostsModule,
    CommentsModule,
    AuthModule,
    CategoriesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

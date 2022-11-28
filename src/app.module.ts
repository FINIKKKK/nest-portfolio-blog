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


@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: '1036845297',
      database: 'portfolio-blog',
      entities: [PostEntity, UserEntity],
      synchronize: true,
    }),
    UsersModule,
    PostsModule,
    CommentsModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

import { PostEntity } from 'src/posts/entities/post.entity';
import { UserEntity } from 'src/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('comments')
export class CommentEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  text: string;

  @ManyToOne(() => UserEntity, { nullable: false })
  @JoinColumn({ name: 'user' })
  user: UserEntity;

  @ManyToOne(() => PostEntity, { nullable: false })
  @JoinColumn({ name: 'post' })
  post: PostEntity;

  @OneToMany((type) => CommentEntity, (comment) => comment.parent)
  @JoinColumn({ name: 'children' })
  children: CommentEntity[];

  @ManyToOne((type) => CommentEntity, (comment) => comment.children, {
    nullable: true,
  })
  @JoinColumn({ name: 'parent' })
  parent: CommentEntity;

  @ManyToOne(() => UserEntity, { nullable: true })
  @JoinColumn({ name: 'parentUser' })
  parentUser: UserEntity;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}

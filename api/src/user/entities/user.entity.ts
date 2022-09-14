import { IUser } from '../user.interface'
import { Entity, Column, PrimaryGeneratedColumn, JoinColumn, OneToOne, ManyToMany } from 'typeorm';
import { DatabaseFile } from 'src/database-file/entities/database-file.entity';
import { IsEmail, IsArray, IsAscii, IsInt, IsBoolean } from "class-validator";
import { Exclude } from 'class-transformer';
import { MatchEntity } from 'src/match-history/match-history.entity';
import { match } from 'assert';

@Entity('user')
export class User implements IUser {
  @PrimaryGeneratedColumn()
  id: number;

  @IsAscii()
  @Column({
    unique: true,
    length: 50
  })
  name: string;
  
  @Column({
    unique: true,
    length: 50
  })
  @Column({ default: '' })
  username42: string

  @IsArray()
  @Column("int", { array: true, default: []})
  friends: number[];

  @IsArray()
  @Column("int", { array: true, default: []})
  blackList: number[];

  @Column()
  avatar42Url: string

  @JoinColumn({ name: 'avatarId'})
  @OneToOne(
    () => DatabaseFile,
    { nullable: true }
  )
  public avatar?: DatabaseFile;
  
  @IsInt()
  @Column({ nullable: true })
  public avatarId?: number;

  @Column({ default: ''})
  @IsEmail()
  email: string;

  @Column({ nullable: true })
  public tfaSecret?: string;

  @IsBoolean()
  @Column({ default: false })
  public isTfaEnabled: boolean;

  @IsInt()
  @Column({ default: 0 })
  win: number;
}
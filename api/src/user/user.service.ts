import { HttpException, HttpStatus, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository} from '@nestjs/typeorm';
import { DatabaseFileService } from 'src/database-file/database-file.service';
import { Connection, In, Repository } from 'typeorm';
import { CreateUserDto } from './dtos/create_user.dto';
import { User } from './entities/user.entity'
import * as bcrypt from 'bcrypt';
import { UpdateNameDto } from './dtos/update_name.dto';

// UserService manages the users repository
@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
        private readonly databaseFilesService: DatabaseFileService,
        private connection: Connection
    ) {}


    // Returns an array containing all users
    async findAll(): Promise<User[]> {
        return await this.usersRepository.find({
            select: [
                "id", "name", "username42", "avatar42Url", "email",
                "friends", "blackList", "avatarId", "win"
            ]
        });
    }

    // Returns a user given its id
    async findOne(id: number): Promise<User> {
        const user = await this.usersRepository.findOne({
            where: { id: id },
            select: [
                "id", "name", "username42", "avatar42Url", "email",
                "friends", "blackList", "avatarId", "win"
            ]
		});
        if (user) {
            return user;
        }
        throw new HttpException('this User does not exist', HttpStatus.NOT_FOUND);
    }

    async findSome(ids: number[]): Promise<User[]> {
        return await this.usersRepository.find({
            where: { id: In(ids) },
            select: [
                "id", "name", "username42", "avatar42Url", "email",
                "friends", "blackList", "avatarId"
            ]
        });
    }

    async findOneByName(name: string): Promise<User> {
		const user = await this.usersRepository.findOne({
            where: { name: name },
            select: [
                "id", "name", "username42", "avatar42Url", "email",
                "friends", "blackList", "avatarId"
            ]
        });
		if (user) {
            return user;
		}
		throw new HttpException('this User does not exist', HttpStatus.NOT_FOUND);
    }

    async findOneBy42Username(username42: string): Promise<User> {
        return await this.usersRepository.findOne({
            where: { username42: username42 },
            select: [
                "id", "name", "username42", "avatar42Url", "email",
                "friends", "blackList", "avatarId", "isTfaEnabled",
            ]
        });
    }

	async findUserNameById(userId: number): Promise<string> {
        const user = await this.usersRepository.findOne({ where: { id: userId } });
        if (user) {
            return user.name;
        }
        return null;
	}

	async findUserWithTfaById(userId: number): Promise<User> {
        const user = await this.usersRepository.findOne({ where: { id: userId } });
        if (user) {
            return user;
        }
        throw new HttpException('this User does not exist', HttpStatus.NOT_FOUND);
	}

    async create(body: CreateUserDto): Promise<User> {
        const user: User = new User();
        user.name = body.name;
        user.username42 = body.username42;
        user.friends = body.friends;
        user.avatar42Url = body.avatar42Url;
        user.email = body.email;
		user.blackList = [];
        return await this.usersRepository.save(user);
    }

    async createRandomUser(): Promise<User> {
        const user: User = new User();
        user.name = (Math.random() + 1).toString(36).substring(2);
        user.username42 = (Math.random() + 1).toString(36).substring(2);
        user.friends = [];
        user.email = user.name + '@student.42.fr';
        user.avatar42Url = "https://img.favpng.com/3/7/23/login-google-account-computer-icons-user-png-favpng-ZwgqcU6LVRjJucQ9udYpX00qa.jpg";
        return await this.usersRepository.save(user);
    }

    async updateName(id: number, body: UpdateNameDto): Promise<User>{
        const userExists: number = await this.usersRepository.count({where: {name: body.name}});
        if (!userExists && body.name.length <= 50) {
            const user = await this.findOne(id);
            user.name = body.name;
            return await this.usersRepository.save(user);
        }
        return null;
    }

    async updateWin(id: number) {
        const user = await this.findOne(id);
        user.win += 1;
        await this.usersRepository.save(user);
    }

    // Removes a user
    async remove(id: number): Promise<void> {
        await this.usersRepository.delete(id);
    }

    // Returns a list of users
    async findFriends(id: number): Promise<User[]> {
        let user = await this.findOne(id);
        if(user) {
            return await this.usersRepository.find({
				where: {
					id: In(user.friends)
				}
			});
        }
    }

    // Adds friendId to the friend's list of id
    async addFriend(id: number, friendId: number) {
        // Ignore if id are identical or if one of them doesn't exist
        if (id == friendId) {
            return;
        }
        let userExists: number = await this.usersRepository.count({where: {id: id}});
        let friendExists: number = await this.usersRepository.count({where: {id: friendId}});
        if (!(userExists > 0 && friendExists > 0)) {
            return;
        }
        // Add friendId if it's not already included in user's friends
        let user = await this.findOne(id);
        if (!user.friends.includes(friendId)) {
            user.friends.push(friendId);
            await this.usersRepository.save(user);
        }
    }
    
    // Removes friendId to the friend's list of id
    async removeFriend(id: number, friendId: number) {
        // Ignore if id are identical or if one of them doesn't exist
        if (id == friendId) {
            return;
        }
        let userExists: number = await this.usersRepository.count({where: {id: id}});
        let friendExists: number = await this.usersRepository.count({where: {id: friendId}});
        if (!(userExists > 0 && friendExists > 0)) {
            return;
        }
        // Removes friendId if it's included in the user's friends
        let user: User = await this.findOne(id);
        let index: number = user.friends.indexOf(friendId);
        if (index > -1) {
            user.friends.splice(index, 1);
            await this.usersRepository.save(user);
        }
    }

	async blockUser(blockedId: number, userId: number) {
		const user: User = await this.usersRepository.findOne({where: {id: userId}});
		const userToBlock: User = await this.usersRepository.findOne({where: {id: blockedId}});
		user.blackList.push(userToBlock.id);
		return this.usersRepository.save(user);
	}

	async unblockUser(unblockedId: number, userId: number) {
		const user: User = await this.usersRepository.findOne({where: {id: userId}});
		const userToUnblock: User = await this.usersRepository.findOne({where: {id: unblockedId}});
		user.blackList = user.blackList.filter( id => {
			return id != unblockedId
		});
		return this.usersRepository.save(user);
	}

    async addAvatar(userId: number, imageBuf: Buffer, filename: string) {
        const queryRunner = this.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const user = await queryRunner.manager.findOne(User, {where: {id: userId}});
            const currentAvatarId = user.avatarId;
            const avatar = await this.databaseFilesService.uploadDatabaseFileWithQueryRunner(imageBuf, filename, queryRunner);
            await queryRunner.manager.update(User, userId, { avatarId: avatar.id });
            if (currentAvatarId) {
                await this.databaseFilesService.deleteFileWithQueryRunner(currentAvatarId, queryRunner);
            }
            await queryRunner.commitTransaction();
            return avatar;
        }
        catch {
            await queryRunner.rollbackTransaction();
            throw new InternalServerErrorException();
        }
        finally {
            await queryRunner.release();
        }
    }

    async setTfaSecret(secret: string, userId: number) {
        return await this.usersRepository.update(userId, { tfaSecret: secret });
    }

    async rmTfaSecret(userId: number) {
        return await this.usersRepository.update(userId, { tfaSecret: null });
    }

    async setTrueTfa(userId: number) {
        return await this.usersRepository.update(userId, { isTfaEnabled: true });
    }
    async setFalseTfa(userId: number) {
        return await this.usersRepository.update(userId, { isTfaEnabled: false });
    }

    async getLadderList(): Promise<User[]> {
        return await this.usersRepository.find({
            select: [
                "id", "name", "username42", "avatar42Url",
                "avatarId", "win"
            ],
            order: { win: "DESC" },
        });
    }
}

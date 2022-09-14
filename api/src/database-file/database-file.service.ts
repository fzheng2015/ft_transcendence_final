import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryRunner, Repository } from 'typeorm';
// import { CreateDatabaseFileDto } from './dto/create-database-file.dto';
// import { UpdateDatabaseFileDto } from './dto/update-database-file.dto';
import { DatabaseFile } from './entities/database-file.entity';

@Injectable()
export class DatabaseFileService {

  constructor(
    @InjectRepository(DatabaseFile)
    private databaseFilesRepository: Repository<DatabaseFile>
  ) {}

  // create(createDatabaseFileDto: CreateDatabaseFileDto) {
  //   return 'This action adds a new databaseFile';
  // }

  async findAll() {
    const here = await this.databaseFilesRepository.find();
    return here;
  }

  // findOne(id: number) {
  //   return `This action returns a #${id} databaseFile`;
  // }

  // update(id: number, updateDatabaseFileDto: UpdateDatabaseFileDto) {
  //   return `This action updates a #${id} databaseFile`;
  // }

  // async remove(id: number) {
  //   await this.databaseFilesRepository.delete(id);
  // }

  async uploadDatabaseFile(dataBuf: Buffer, filename: string) {
    const newFile = this.databaseFilesRepository.create({
      filename,
      data: dataBuf,
    })
    await this.databaseFilesRepository.save(newFile);
    return newFile;
  }

  async getFileById(fileId: number) {
    const file = await this.databaseFilesRepository.findOne({
		where: {
			id: fileId,
		}
	});
    if (!file) {
      throw new NotFoundException();
    }
    return file;
  }

  async uploadDatabaseFileWithQueryRunner(
    dataBuf: Buffer,
    filename: string,
    queryRunner: QueryRunner) {
      const newFile = queryRunner.manager.create(DatabaseFile, {
        filename,
        data: dataBuf
      })
      await queryRunner.manager.save(DatabaseFile, newFile);
      return newFile;
  }

  async deleteFileWithQueryRunner(fileId: number, queryRunner: QueryRunner) {
    const deleteResponse = await queryRunner.manager.delete(DatabaseFile, fileId);
    if (!deleteResponse.affected) {
      throw new NotFoundException();
    }
  }
}

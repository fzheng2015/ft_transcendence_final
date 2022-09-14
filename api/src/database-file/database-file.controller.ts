import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseInterceptors, ClassSerializerInterceptor, UseGuards, Res, StreamableFile } from '@nestjs/common';
import { Response } from 'express';
import { Readable } from 'stream';
import { DatabaseFileService } from './database-file.service';

@Controller('database-file')
export class DatabaseFileController {
  constructor(
    private readonly databaseFileService: DatabaseFileService
  ) { }

  @Get()
  findAll() {
    return this.databaseFileService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number, @Res({ passthrough: true }) res: Response) {
    const file = await this.databaseFileService.getFileById(id);
    const stream = Readable.from(file.data);

    res.set({
      'Content-Disposition': `inline; filename="${file.filename}`,
      'Content-Type': 'image'
    })
    return new StreamableFile(stream);
  }

}

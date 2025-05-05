import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { fileFilter } from './helpers/fileFilter.helper';
import { diskStorage } from 'multer';
import { fileRenamer } from './helpers/fileRenamer.helper';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';

@Controller('files')
export class FilesController {
  constructor(
    
    private readonly filesService: FilesService,
    private readonly configService: ConfigService,
  ) {}

  @Post('product')
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: fileFilter,
      limits: { fileSize: 1024 * 1024 * 5 },
      storage: diskStorage({
        destination: './static/products',
        filename: fileRenamer,
      }),
    }),
  )
  uploadFile(
    @UploadedFile()
    file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided!');
    }

    const secureUrl = `${this.configService.get('HOST_API')}/files/product/${file.filename}`;
  
    return { secureUrl };
  }

  @Get('product/:filename')
  findOne(@Param('filename') filename: string, @Res() res: Response) {
    const path = this.filesService.getStaticFile(filename);
    return res.sendFile(path);
  }
}

import { BadRequestException, Injectable } from '@nestjs/common';
import { existsSync } from 'fs';
import { join } from 'path';

@Injectable()
export class FilesService {


  uploadFile(file) {
  }
  

  getStaticFile(filename: string) {
    const path=  join(__dirname, '..', '..', 'static', 'products', filename);
    if(!existsSync(path)){
      throw new BadRequestException('File not found!');
    }
    return path

  }

}

import { v4 as uuid } from 'uuid';

export const fileRenamer = (
  req: Express.Request,
  file: Express.Multer.File,
  cb: Function,
) => {

  if (!file) {
    return cb(new Error('No file provided!'));
  }
  const fileExtension = file.mimetype.split('/')[1];
  const filename = `${uuid()}.${fileExtension}`;

   return cb(null, filename);
};
//

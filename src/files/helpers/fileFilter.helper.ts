export const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  cb: Function,
) => {
  const fileTypes = ['jpeg', 'jpg', 'png', 'gif'];
  if (!fileTypes.includes(file.mimetype.split('/')[1])) {
    return cb(null, false);
  }
  return cb(null, true);
};
//

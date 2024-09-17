/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request } from 'express';
import multer, { memoryStorage } from 'multer';

const fileUpload = () => {
  const upload = multer({
    storage: memoryStorage(),
    limits: {
      fileSize: 20000000, // Limit file size to 2MB
    },

    fileFilter: function (req: Request, file, cb) {
      // Check if the file type is allowed
      if (
        file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/jpeg' ||
        file.mimetype === 'image/svg' ||
        file.mimetype === 'image/svg+xml'
      ) {
        cb(null, true); // No error, accept file
      } else {
        // Create an instance of Error and pass it
        const error: any = new Error(
          'Only png, jpg, jpeg, and svg formats are allowed',
        );
        cb(error, false); // Pass the error object and reject the file
      }
    },
  });

  return upload;
};

const upload = fileUpload();
export default upload;

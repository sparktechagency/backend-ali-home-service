import fs from "fs";
import util from "util";
const unlinkSync = util.promisify(fs.unlink);
export const deleteFile = async (path: string) => {
  console.log(path);
  try {
    if (fs.existsSync(`../public/${path}`)) {
      await unlinkSync(`../public/${path}`);
    } else {
      console.log("not found");
    }
  } catch (err: any) {
    console.log(err);
    throw new Error(`Error deleting file: ${err.message}`);
  }
};

export const storeFile = (folderName: string, filename: string) => {
  return `/uploads/${folderName}/${filename}`;
};

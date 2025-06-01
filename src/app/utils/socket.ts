import { io } from '../../server';

export const emitMessage = (key: string, data: any) => {
  io.emit(key, data);
};

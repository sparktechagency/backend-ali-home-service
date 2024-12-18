import { Router } from 'express';

import auth from '../../middleware/auth';
import upload from '../../middleware/fileUpload';
import parseData from '../../middleware/parseData';
import validateRequest from '../../middleware/validateRequest';
import { USER_ROLE } from '../user/user.constant';
import { messagesController } from './messages.controller';
import { messagesValidation } from './messages.validation';

const router = Router();
// const storage = memoryStorage();
// const upload = multer({ storage });

router.post(
  '/send-messages',

  validateRequest(messagesValidation.sendMessageValidation),
  messagesController.createMessages,
);
router.post(
  '/upload/images',

  // validateRequest(messagesValidation.sendMessageValidation),
  upload.fields([{ name: 'files', maxCount: 5 }]),
  auth(USER_ROLE.customer, USER_ROLE.provider),
  messagesController.UploadImage,
);

router.patch(
  '/seen/:chatId',

  messagesController.seenMessage,
);

router.patch(
  '/update/:id',

  parseData(),
  validateRequest(messagesValidation.updateMessageValidation),
  messagesController.updateMessages,
);

router.get('/my-messages/:chatId', messagesController.getMessagesByChatId);

router.delete(
  '/:id',

  messagesController.deleteMessages,
);

router.get(
  '/:id',

  messagesController.getMessagesById,
);

router.get('/', messagesController.getAllMessages);

export const messagesRoutes = router;

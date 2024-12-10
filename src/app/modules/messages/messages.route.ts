import { Router } from 'express';
import parseData from '../../middleware/parseData';
import validateRequest from '../../middleware/validateRequest';
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

router.get(
  '/',

  messagesController.getAllMessages,
);

export const messagesRoutes = router;

import { Router } from 'express';

import auth from '../../middleware/auth';
import validateRequest from '../../middleware/validateRequest';
import { USER_ROLE } from '../user/user.constant';
import { chatController } from './chat.controller';
import { chatValidation } from './chat.validation';

const router = Router();

router.post(
  '/',

  validateRequest(chatValidation.createChatValidation),
  chatController.createChat,
);

router.get(
  '/customer/:customer',
  auth(USER_ROLE.customer, USER_ROLE.provider),
  chatController.getChatIdByCustomer,
);
router.patch(
  '/:id',
  validateRequest(chatValidation.createChatValidation),
  chatController.updateChat,
);

router.delete('/:id', chatController.deleteChat);

router.get(
  '/my-chat-list',
  auth(USER_ROLE.customer, USER_ROLE.provider),
  chatController.getMyChatListv2ForRestApi,
);

router.get('/:id', chatController.getChatById);

export const chatRoutes = router;

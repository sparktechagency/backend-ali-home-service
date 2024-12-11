import { Router } from 'express';
import validateRequest from '../../middleware/validateRequest';
import { chatController } from './chat.controller';
import { chatValidation } from './chat.validation';

const router = Router();

router.post(
  '/',

  validateRequest(chatValidation.createChatValidation),
  chatController.createChat,
);

router.patch(
  '/:id',
  validateRequest(chatValidation.createChatValidation),
  chatController.updateChat,
);

router.delete('/:id', chatController.deleteChat);

router.get('/my-chat-list', chatController.getMyChatListv2);

router.get('/:id', chatController.getChatById);

export const chatRoutes = router;

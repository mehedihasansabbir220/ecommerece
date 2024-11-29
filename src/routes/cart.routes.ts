// src/routes/cart.routes.ts
import express from 'express';
import { CartController } from '../controllers/cart.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validation.middleware';
import Joi from 'joi';

const router = express.Router();
const cartController = new CartController();

const addToCartSchema = Joi.object({
  productId: Joi.string().required(),
  quantity: Joi.number().min(1).required()
});

router.use(authMiddleware.authenticate);

router.post(
  '/add', 
  validateRequest(addToCartSchema),
  cartController.addToCart
);

router.get(
  '/', 
  cartController.getCart
);

router.delete(
  '/remove/:productId', 
  cartController.removeFromCart
);

export default router;

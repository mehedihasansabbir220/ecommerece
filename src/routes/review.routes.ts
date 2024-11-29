// src/routes/review.routes.ts
import express from 'express';
import { ReviewController } from '../controllers/review.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validation.middleware';
import Joi from 'joi';

const router = express.Router();
const reviewController = new ReviewController();

const createReviewSchema = Joi.object({
  productId: Joi.string().required(),
  orderId: Joi.string().required(),
  rating: Joi.number().min(1).max(5).required(),
  comment: Joi.string().max(500),
  images: Joi.array().items(Joi.string().uri())
});

router.post(
  '/', 
  authMiddleware.authenticate,
  validateRequest(createReviewSchema),
  reviewController.createReview
);

router.get(
  '/product/:productId', 
  reviewController.getProductReviews
);

export default router;
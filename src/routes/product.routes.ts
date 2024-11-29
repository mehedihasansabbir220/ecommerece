import express, { Request, Response, NextFunction } from 'express';
import { ProductController } from '../controllers/product.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { UserRole } from '../models/user.model';
import { validateRequest } from '../middlewares/validation.middleware';
import Joi from 'joi';

const router = express.Router();
const productController = new ProductController();

// Async wrapper to handle route handlers
const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) => 
  (req: Request, res: Response, next: NextFunction): void => {
    fn(req, res, next).catch(next);
  };

// Product creation validation schema
const productCreateSchema = Joi.object({
  name: Joi.string().required().min(3).max(200),
  description: Joi.string().required().min(10).max(1000),
  price: Joi.number().required().positive(),
  category: Joi.string().required(),
  brand: Joi.string().required(),
  stockQuantity: Joi.number().required().min(0),
  images: Joi.array().items(Joi.string().uri()),
  discountPercentage: Joi.number().min(0).max(100)
});

// Product update validation schema
const productUpdateSchema = Joi.object({
  name: Joi.string().min(3).max(200),
  description: Joi.string().min(10).max(1000),
  price: Joi.number().positive(),
  category: Joi.string(),
  brand: Joi.string(),
  stockQuantity: Joi.number().min(0),
  images: Joi.array().items(Joi.string().uri()),
  discountPercentage: Joi.number().min(0).max(100),
  isActive: Joi.boolean()
});

// Product routes with async handlers
router.post(
  '/', 
  authMiddleware.authenticate,
  authMiddleware.authorize([UserRole.VENDOR, UserRole.ADMIN]),
  validateRequest(productCreateSchema),
  asyncHandler(async (req: Request, res: Response) => {
    await productController.createProduct(req, res);
  })
);

router.get(
  '/', 
  asyncHandler(async (req: Request, res: Response) => {
    await productController.getAllProducts(req, res);
  })
);

router.get(
  '/:id', 
  asyncHandler(async (req: Request, res: Response) => {
    await productController.getProductById(req, res);
  })
);

router.patch(
  '/:id',
  authMiddleware.authenticate,
  authMiddleware.authorize([UserRole.VENDOR, UserRole.ADMIN]),
  validateRequest(productUpdateSchema),
  asyncHandler(async (req: Request, res: Response) => {
    await productController.updateProduct(req, res);
  })
);

router.delete(
  '/:id',
  authMiddleware.authenticate,
  authMiddleware.authorize([UserRole.VENDOR, UserRole.ADMIN]),
  asyncHandler(async (req: Request, res: Response) => {
    await productController.deleteProduct(req, res);
  })
);

export default router;

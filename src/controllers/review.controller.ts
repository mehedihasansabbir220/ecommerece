// src/controllers/review.controller.ts
import { Request, Response } from 'express';
import { Review } from '../models/review.model';
import { Order } from '../models/order.model';
import { Product } from '../models/product.model';

export class ReviewController {
  // Create a review
  async createReview(req: Request, res: Response) {
    try {
      const { 
        productId, 
        orderId, 
        rating, 
        comment, 
        images 
      } = req.body;
      const userId = req.user!.id;

      // Verify order exists and belongs to user
      const order = await Order.findOne({ 
        _id: orderId, 
        user: userId,
        status: 'delivered' 
      });

      if (!order) {
        return res.status(400).json({ 
          message: 'Invalid order for review' 
        });
      }

      // Check if product is in the order
      const productInOrder = order.items.some(
        item => item.product.toString() === productId
      );

      if (!productInOrder) {
        return res.status(400).json({ 
          message: 'Product not found in order' 
        });
      }

      // Check if review already exists for this order and product
      const existingReview = await Review.findOne({ 
        order: orderId, 
        product: productId 
      });

      if (existingReview) {
        return res.status(400).json({ 
          message: 'Review already submitted for this product' 
        });
      }

      // Create review
      const review = new Review({
        user: userId,
        product: productId,
        order: orderId,
        rating,
        comment,
        images,
        isVerifiedPurchase: true
      });

      await review.save();

      res.status(201).json({
        message: 'Review submitted successfully',
        review
      });
    } catch (error) {
      res.status(500).json({ 
        message: 'Error creating review', 
        error: (error as Error).message 
      });
    }
  }

  // Get reviews for a product
  async getProductReviews(req: Request, res: Response) {
    try {
      const { productId } = req.params;
      const { 
        page = 1, 
        limit = 10, 
        minRating 
      } = req.query;

      const filter: any = { product: productId };
      if (minRating) {
        filter.rating = { $gte: Number(minRating) };
      }

      const reviews = await Review.find(filter)
        .populate('user', 'firstName lastName')
        .limit(Number(limit))
        .skip((Number(page) - 1) * Number(limit))
        .sort({ createdAt: -1 });

      const total = await Review.countDocuments(filter);

      res.json({
        reviews,
        totalPages: Math.ceil(total / Number(limit)),
        currentPage: Number(page)
      });
    } catch (error) {
      res.status(500).json({ 
        message: 'Error fetching reviews', 
        error: (error as Error).message 
      });
    }
  }
}
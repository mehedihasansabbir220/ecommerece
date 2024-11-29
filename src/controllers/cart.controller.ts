// src/controllers/cart.controller.ts
import { Request, Response } from 'express';
import { Cart, ICartItem } from '../models/cart.model';
import { Product } from '../models/product.model';

export class CartController {
  // Add item to cart
  async addToCart(req: Request, res: Response) {
    try {
      const { productId, quantity } = req.body;
      const userId = req.user!.id;

      // Find the product
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      // Check stock availability
      if (product.stockQuantity < quantity) {
        return res.status(400).json({ 
          message: 'Insufficient stock',
          availableStock: product.stockQuantity
        });
      }

      // Find or create cart
      let cart = await Cart.findOne({ user: userId });
      if (!cart) {
        cart = new Cart({ user: userId, items: [] });
      }

      // Check if product already in cart
      const existingItemIndex = cart.items.findIndex(
        item => item.product.toString() === productId
      );

      if (existingItemIndex > -1) {
        // Update quantity
        cart.items[existingItemIndex].quantity += quantity;
      } else {
        // Add new item
        cart.items.push({
          product: productId,
          quantity,
          price: product.getPriceAfterDiscount()
        });
      }

      await cart.save();

      res.status(200).json({
        message: 'Item added to cart',
        cart
      });
    } catch (error) {
      res.status(500).json({ 
        message: 'Error adding to cart', 
        error: (error as Error).message 
      });
    }
  }

  // Get user's cart
  async getCart(req: Request, res: Response) {
    try {
      const cart = await Cart.findOne({ user: req.user!.id })
        .populate('items.product');

      if (!cart) {
        return res.status(404).json({ message: 'Cart not found' });
      }

      res.json(cart);
    } catch (error) {
      res.status(500).json({ 
        message: 'Error fetching cart', 
        error: (error as Error).message 
      });
    }
  }

  // Remove item from cart
  async removeFromCart(req: Request, res: Response) {
    try {
      const { productId } = req.params;
      const userId = req.user!.id as string;

      const cart = await Cart.findOne({ user: userId });
      if (!cart) {
        return res.status(404).json({ message: 'Cart not found' });
      }

      cart.items = cart.items.filter(
        item => item.product.toString() !== productId
      );

      await cart.save();

      res.json({
        message: 'Item removed from cart',
        cart
      });
    } catch (error) {
      res.status(500).json({ 
        message: 'Error removing from cart', 
        error: (error as Error).message 
      });
    }
  }
}
import express, { Request, Response, NextFunction } from 'express';
import { Order } from '../models/order.model';
import { User } from '../models/user.model';
import { Product } from '../models/product.model';

const router = express.Router();

// Create an order
router.post('/orders', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, items, totalPrice, shippingAddress, paymentMethod } = req.body;

    // Validate user existence
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Create a new order
    const order = new Order({
      user: userId,
      items,
      totalPrice,
      shippingAddress,
      paymentMethod,
      paymentStatus: 'pending'
    });

    const savedOrder = await order.save();
    res.status(201).json({ order: savedOrder });
  } catch (error) {
    next(error);
  }
});

// Get all orders
router.get('/orders', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orders = await Order.find().populate('user').populate('items.product');
    res.status(200).json({ orders });
  } catch (error) {
    next(error);
  }
});

// Get a specific order by ID
router.get('/orders/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const order = await Order.findById(req.params.id).populate('user').populate('items.product');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.status(200).json({ order });
  } catch (error) {
    next(error);
  }
});

// Update an order by ID
router.put('/orders/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, trackingNumber } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status, trackingNumber },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.status(200).json({ order });
  } catch (error) {
    next(error);
  }
});

// Delete an order by ID
router.delete('/orders/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;

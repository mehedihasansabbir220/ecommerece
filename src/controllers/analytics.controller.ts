// src/controllers/analytics.controller.ts
import { Request, Response } from 'express';
import { Order, OrderStatus } from '../models/order.model';
import { Product } from '../models/product.model';
import { User, UserRole } from '../models/user.model';
import mongoose from 'mongoose';

export class AnalyticsController {
  // Sales Overview
  async getSalesOverview(req: Request, res: Response) {
    try {
      // Total sales by month
      const monthlySales = await Order.aggregate([
        {
          $match: {
            status: OrderStatus.DELIVERED,
            createdAt: {
              $gte: new Date(new Date().getFullYear(), 0, 1),
              $lt: new Date(new Date().getFullYear() + 1, 0, 1)
            }
          }
        },
        {
          $group: {
            _id: { $month: '$createdAt' },
            totalSales: { $sum: '$totalPrice' },
            orderCount: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]);

      // Top-selling products
      const topProducts = await Order.aggregate([
        { $match: { status: OrderStatus.DELIVERED } },
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.product',
            totalQuantity: { $sum: '$items.quantity' },
            totalRevenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } }
          }
        },
        {
          $lookup: {
            from: 'products',
            localField: '_id',
            foreignField: '_id',
            as: 'productDetails'
          }
        },
        { $unwind: '$productDetails' },
        {
          $project: {
            name: '$productDetails.name',
            totalQuantity: 1,
            totalRevenue: 1
          }
        },
        { $sort: { totalQuantity: -1 } },
        { $limit: 10 }
      ]);

      // Revenue by category
      const revenueByCategory = await Order.aggregate([
        { $match: { status: OrderStatus.DELIVERED } },
        { $unwind: '$items' },
        {
          $lookup: {
            from: 'products',
            localField: 'items.product',
            foreignField: '_id',
            as: 'productDetails'
          }
        },
        { $unwind: '$productDetails' },
        {
          $lookup: {
            from: 'categories',
            localField: 'productDetails.category',
            foreignField: '_id',
            as: 'categoryDetails'
          }
        },
        { $unwind: '$categoryDetails' },
        {
          $group: {
            _id: '$categoryDetails._id',
            categoryName: { $first: '$categoryDetails.name' },
            totalRevenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } },
            totalSales: { $sum: '$items.quantity' }
          }
        },
        { $sort: { totalRevenue: -1 } }
      ]);

      // Key performance indicators
      const kpis = {
        totalRevenue: monthlySales.reduce((sum, month) => sum + month.totalSales, 0),
        totalOrders: monthlySales.reduce((sum, month) => sum + month.orderCount, 0),
        averageOrderValue: monthlySales.reduce((sum, month) => sum + month.totalSales, 0) / 
          monthlySales.reduce((sum, month) => sum + month.orderCount, 0) || 0
      };

      res.json({
        monthlySales,
        topProducts,
        revenueByCategory,
        kpis
      });
    } catch (error) {
      res.status(500).json({ 
        message: 'Error generating analytics', 
        error: (error as Error).message 
      });
    }
  }

  // User Growth and Segmentation
  async getUserAnalytics(req: Request, res: Response) {
    try {
      // User registration by month
      const userGrowth = await User.aggregate([
        {
          $group: {
            _id: { 
              month: { $month: '$createdAt' },
              year: { $year: '$createdAt' }
            },
            userCount: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]);

      // User segmentation by role
      const userSegmentation = await User.aggregate([
        {
          $group: {
            _id: '$role',
            count: { $sum: 1 }
          }
        }
      ]);

      // Active users (users who placed orders in the last 30 days)
      const activeUsers = await Order.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            }
          }
        },
        {
          $group: {
            _id: '$user',
            lastOrderDate: { $max: '$createdAt' },
            totalOrders: { $sum: 1 }
          }
        },
        { $count: 'activeUserCount' }
      ]);

      res.json({
        userGrowth,
        userSegmentation,
        activeUserCount: activeUsers[0]?.activeUserCount || 0
      });
    } catch (error) {
      res.status(500).json({ 
        message: 'Error generating user analytics', 
        error: (error as Error).message 
      });
    }
  }

  // Inventory and Stock Analysis
  async getInventoryAnalytics(req: Request, res: Response) {
    try {
      // Low stock products
      const lowStockProducts = await Product.aggregate([
        {
          $match: {
            stockQuantity: { $lt: 10 },
            isActive: true
          }
        },
        {
          $project: {
            name: 1,
            stockQuantity: 1,
            brand: 1
          }
        },
        { $sort: { stockQuantity: 1 } }
      ]);

      // Total inventory value
      const inventoryValue = await Product.aggregate([
        {
          $group: {
            _id: null,
            totalValue: { $sum: { $multiply: ['$price', '$stockQuantity'] } },
            totalProducts: { $sum: 1 }
          }
        }
      ]);

      // Product performance
      const productPerformance = await Product.aggregate([
        {
          $lookup: {
            from: 'orders',
            let: { productId: '$_id' },
            pipeline: [
              { $unwind: '$items' },
              {
                $match: {
                  $expr: {
                    $eq: ['$items.product', '$$productId']
                  }
                }
              },
              {
                $group: {
                  _id: null,
                  totalSold: { $sum: '$items.quantity' },
                  totalRevenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } }
                }
              }
            ],
            as: 'sales'
          }
        },
        {
          $addFields: {
            totalSold: { $ifNull: [{ $arrayElemAt: ['$sales.totalSold', 0] }, 0] },
            totalRevenue: { $ifNull: [{ $arrayElemAt: ['$sales.totalRevenue', 0] }, 0] }
          }
        },
        {
          $project: {
            name: 1,
            stockQuantity: 1,
            totalSold: 1,
            totalRevenue: 1
          }
        },
        { $sort: { totalSold: -1 } },
        { $limit: 10 }
      ]);

      res.json({
        lowStockProducts,
        inventoryValue: inventoryValue[0],
        productPerformance
      });
    } catch (error) {
      res.status(500).json({ 
        message: 'Error generating inventory analytics', 
        error: (error as Error).message 
      });
    }
  }
}
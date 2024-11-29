import { Request, Response } from 'express';
import { Product } from '../models/product.model';
import { UserRole } from '../models/user.model';

export class ProductController {
  // Create a new product (Vendor/Admin only)
  async createProduct(req: Request, res: Response) {
    try {
      const productData = {
        ...req.body,
        vendor: req.user?.id // Ensure we use optional chaining here
      };

      const product = new Product(productData);
      await product.save();

      res.status(201).json({
        message: 'Product created successfully',
        product
      });
    } catch (error) {
      res.status(400).json({ 
        message: 'Error creating product', 
        error: (error as Error).message 
      });
    }
  }

  // Get all products with filtering and pagination
  async getAllProducts(req: Request, res: Response) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        category, 
        minPrice, 
        maxPrice, 
        brand 
      } = req.query;

      const filter: any = { isActive: true };

      if (category) filter.category = category;
      if (brand) filter.brand = brand;
      if (minPrice || maxPrice) {
        filter.price = {};
        if (minPrice) filter.price.$gte = Number(minPrice);
        if (maxPrice) filter.price.$lte = Number(maxPrice);
      }

      const products = await Product.find(filter)
        .limit(Number(limit))
        .skip((Number(page) - 1) * Number(limit))
        .populate('category')
        .populate('vendor', 'firstName lastName');

      const total = await Product.countDocuments(filter);

      res.json({
        products,
        totalPages: Math.ceil(total / Number(limit)),
        currentPage: Number(page)
      });
    } catch (error) {
      res.status(500).json({ 
        message: 'Error fetching products', 
        error: (error as Error).message 
      });
    }
  }

  // Get product by ID
  async getProductById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const product = await Product.findById(id).populate('vendor', 'firstName lastName');

      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      res.json(product);
    } catch (error) {
      res.status(500).json({ 
        message: 'Error fetching product', 
        error: (error as Error).message 
      });
    }
  }

  // Update a product (Vendor/Admin only)
  async updateProduct(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const product = await Product.findById(id);

      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      if (product.vendor.toString() !== req.user?.id && req.user?.role !== UserRole.ADMIN) {
        return res.status(403).json({ message: 'Unauthorized to update this product' });
      }

      const updatedProduct = await Product.findByIdAndUpdate(id, req.body, { new: true });

      res.json({
        message: 'Product updated successfully',
        product: updatedProduct
      });
    } catch (error) {
      res.status(500).json({ 
        message: 'Error updating product', 
        error: (error as Error).message 
      });
    }
  }

  // Delete a product (Vendor/Admin only)
  async deleteProduct(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const product = await Product.findById(id);

      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      if (product.vendor.toString() !== req.user?.id && req.user?.role !== UserRole.ADMIN) {
        return res.status(403).json({ message: 'Unauthorized to delete this product' });
      }

      await Product.findByIdAndDelete(id);

      res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
      res.status(500).json({ 
        message: 'Error deleting product', 
        error: (error as Error).message 
      });
    }
  }
}

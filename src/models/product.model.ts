// src/models/product.model.ts
import mongoose from 'mongoose';

export interface IProduct extends mongoose.Document {
  name: string;
  description: string;
  price: number;
  category: mongoose.Types.ObjectId;
  brand: string;
  stockQuantity: number;
  images: string[];
  vendor: mongoose.Types.ObjectId;
  discountPercentage?: number;
  isActive: boolean;
  reviews: mongoose.Types.ObjectId[];
}

const ProductSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  description: { 
    type: String, 
    required: true 
  },
  price: { 
    type: Number, 
    required: true,
    min: 0
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  brand: { 
    type: String, 
    required: true 
  },
  stockQuantity: { 
    type: Number, 
    required: true,
    min: 0
  },
  images: [{ 
    type: String 
  }],
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  discountPercentage: { 
    type: Number, 
    default: 0,
    min: 0,
    max: 100
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  reviews: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review'
  }],
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Create price after discount method
ProductSchema.methods.getPriceAfterDiscount = function() {
  return this.price * (1 - this.discountPercentage / 100);
};

export const Product = mongoose.model<IProduct>('Product', ProductSchema);
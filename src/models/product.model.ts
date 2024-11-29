import mongoose, { Document, Schema } from 'mongoose';

export interface IProduct extends Document {
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
  getPriceAfterDiscount(): number; // Add the method signature here
  createdAt:{
    
  }
}

const ProductSchema = new Schema<IProduct>({
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

// Define the method on the schema
ProductSchema.methods.getPriceAfterDiscount = function() {
  return this.price * (1 - this.discountPercentage / 100);
};

export const Product = mongoose.model<IProduct>('Product', ProductSchema);

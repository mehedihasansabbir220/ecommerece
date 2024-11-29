// src/models/cart.model.ts
import mongoose from 'mongoose';

export interface ICartItem {
  product: mongoose.Types.ObjectId;
  quantity: number;
  price: number;
}

export interface ICart extends mongoose.Document {
  user: mongoose.Types.ObjectId;
  items: ICartItem[];
  totalPrice: number;
  discount: number;
}

const CartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true
    }
  }],
  totalPrice: {
    type: Number,
    default: 0
  },
  discount: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

// Calculate total price before save
CartSchema.pre('save', function(next) {
  this.totalPrice = this.items.reduce((total, item) => 
    total + (item.price * item.quantity), 0);
  next();
});

export const Cart = mongoose.model<ICart>('Cart', CartSchema);

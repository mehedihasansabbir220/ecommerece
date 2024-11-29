// src/models/review.model.ts
import mongoose from 'mongoose';

export interface IReview extends mongoose.Document {
  user: mongoose.Types.ObjectId;
  product: mongoose.Types.ObjectId;
  order: mongoose.Types.ObjectId;
  rating: number;
  comment: string;
  images?: string[];
  isVerifiedPurchase: boolean;
}

const ReviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    trim: true,
    maxlength: 500
  },
  images: [{
    type: String,
    validate: {
      validator: function(v: string) {
        return /^https?:\/\/.+\.(jpg|jpeg|png|gif)$/i.test(v);
      },
      message: 'Invalid image URL'
    }
  }],
  isVerifiedPurchase: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// Aggregate average rating for product
ReviewSchema.statics.calculateAverageRating = async function(productId) {
  const stats = await this.aggregate([
    { $match: { product: productId } },
    {
      $group: {
        _id: '$product',
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 }
      }
    }
  ]);

  if (stats.length > 0) {
    await mongoose.model('Product').findByIdAndUpdate(productId, {
      averageRating: stats[0].averageRating,
      totalReviews: stats[0].totalReviews
    });
  }
};

// Middleware to update product rating after review
ReviewSchema.post('save', async function() {
  await this.constructor.calculateAverageRating(this.product);
});

export const Review = mongoose.model<IReview>('Review', ReviewSchema);
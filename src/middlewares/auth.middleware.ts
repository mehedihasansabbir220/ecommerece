// src/middlewares/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/environment';
import { User, UserRole } from '../models/user.model';
import { Types } from 'mongoose';

interface TokenPayload {
  userId: string;
  role: UserRole;
}

export const authMiddleware = {
  authenticate: async (req: Request, res: Response, next: NextFunction) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
      const decoded = jwt.verify(token, ENV.JWT_SECRET) as TokenPayload;
      const user = await User.findById(decoded.userId);

      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }

      req.user = {
        id: user._id,
        role: user.role
      };
      next();
    } catch (error) {
      res.status(401).json({ message: 'Token is not valid' });
    }
  },

  authorize: (roles: UserRole[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
      if (!req.user || !roles.includes(req.user.role)) {
        return res.status(403).json({ message: 'Access denied' });
      }
      next();
    };
  }
};
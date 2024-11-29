import { Request, Response } from 'express';
import { User } from '../models/user.model';
import { UserRole } from '../models/user.model';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key';

export class UserController {
  // Register a new user
  async register(req: Request, res: Response) {
    try {
      const { email, password, firstName, lastName, role } = req.body;

      // Check if the user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      // Create a new user
      const user = new User({ email, password, firstName, lastName, role });
      await user.save();

      res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error registering user', error: (error as Error).message });
    }
  }

  // Login user
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid password' });
      }

      // Generate JWT token
      const token = jwt.sign({ id: user._id, role: user.role }, SECRET_KEY, { expiresIn: '1h' });

      res.status(200).json({ token, message: 'Login successful' });
    } catch (error) {
      res.status(500).json({ message: 'Error logging in', error: (error as Error).message });
    }
  }

  // Get user profile
  async getProfile(req: Request, res: Response) {
    try {
      const userId = req.user?.id; // Assuming `req.user` is set by a middleware

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching user profile', error: (error as Error).message });
    }
  }

  // Update user profile
  async updateProfile(req: Request, res: Response) {
    try {
      const userId = req.user?.id; // Assuming `req.user` is set by a middleware
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const updatedData = req.body;
      const updatedUser = await User.findByIdAndUpdate(userId, updatedData, { new: true });

      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.status(200).json({ message: 'Profile updated successfully', user: updatedUser });
    } catch (error) {
      res.status(500).json({ message: 'Error updating user profile', error: (error as Error).message });
    }
  }
}

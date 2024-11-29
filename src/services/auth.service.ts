// src/services/auth.service.ts
import jwt from 'jsonwebtoken';
import { User, UserRole, IUser } from '../models/user.model';
import { ENV } from '../config/environment';

export interface RegisterDTO {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: UserRole;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export class AuthService {
  async register(data: RegisterDTO): Promise<{ user: IUser; token: string }> {
    // Check if user already exists
    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
      throw new Error('User already exists');
    }

    // Create new user
    const user = new User({
      email: data.email,
      password: data.password,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role || UserRole.CUSTOMER
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role }, 
      ENV.JWT_SECRET, 
      { expiresIn: '7d' }
    );

    return { user, token };
  }

  async login(data: LoginDTO): Promise<{ user: IUser; token: string }> {
    const user = await User.findOne({ email: data.email });
    
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isMatch = await user.comparePassword(data.password);
    
    if (!isMatch) {
      throw new Error('Invalid credentials');
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role }, 
      ENV.JWT_SECRET, 
      { expiresIn: '7d' }
    );

    return { user, token };
  }
}
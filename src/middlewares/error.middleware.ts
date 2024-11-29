import { Request, Response, NextFunction } from 'express';

export function errorMiddleware(err: any, req: Request, res: Response, next: NextFunction) {
  console.error(err.stack);

  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: err.message });
  }

  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    return res.status(404).json({ message: 'Resource not found' });
  }

  if (err.name === 'MongoError' && err.code === 11000) {
    return res.status(409).json({ message: 'Duplicate key error' });
  }

  return res.status(500).json({ message: 'Internal Server Error', error: err.message });
}

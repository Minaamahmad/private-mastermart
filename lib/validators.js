import mongoose from 'mongoose';

export function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

export function parseObjectId(id) {
  if (!isValidObjectId(id)) return null;
  return id;
}

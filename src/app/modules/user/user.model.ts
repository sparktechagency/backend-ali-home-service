/* eslint-disable @typescript-eslint/no-this-alias */
import bcrypt from 'bcrypt';
import { model, Schema } from 'mongoose';
import { ImageSchema } from '../../../common/schemas/image.schema';
import config from '../../config';
import { TUser, UserModel, UserRole } from './user.interface';

// Define the schema for Verification
const VerificationSchema = new Schema({
  otp: {
    type: Number, // Allows string or number
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },

  status: {
    type: Boolean,
    required: true,
  },
});

// Define the schema for the User model
const UserSchema = new Schema<TUser, UserModel>(
  {
    email: {
      type: String,
      unique: true,
    },
    password: {
      type: String,
      // required: true,
      default: '',
    },
    countryCode: {
      type: String,
      // required: true,
      default: '',
    },

    phoneNumber: {
      type: String,
      // required: true,
      // unique: true,
      default: '',
    },
    needsPasswordChange: {
      type: Boolean,
      default: false,
    },
    passwordChangedAt: {
      type: Date,
    },
    accountType: {
      type: String,
      enum: ['custom', 'google'],
      default: 'custom',
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isVerified: {
      type: Boolean,
      default: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    verification: {
      type: VerificationSchema,
      required: true,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  },
);

const AdminSchema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    image: ImageSchema,
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true },
);

// Pre-save hook to hash password if it is modified or new
UserSchema.pre('save', async function (next) {
  const user = this;
  user.password = await bcrypt.hash(
    user.password as string,
    Number(config.bcrypt_salt_rounds),
  );
  next();
});

// set '' after saving password
UserSchema.post('save', function (doc, next) {
  doc.password = '';
  next();
});

// Check if a user exists by email
UserSchema.statics.isUserExist = async function (
  email: string,
): Promise<TUser | null> {
  return this.findOne({ email });
};

// Check if a user exists by phone number
UserSchema.statics.isUserExistByNumber = async function (
  countryCode: string,
  phoneNumber: string,
) {
  return this.findOne({ countryCode, phoneNumber }).select('+password');
};

// Check if a user exists by ID
UserSchema.statics.IsUserExistbyId = async function (
  id: string,
): Promise<TUser | null> {
  return this.findById(id);
};

// Compare plain text password with hashed password
UserSchema.statics.isPasswordMatched = async function (
  plainTextPassword: string,
  hashedPassword: string,
): Promise<boolean> {
  return bcrypt.compare(plainTextPassword, hashedPassword);
};

// filter out deleted documents
UserSchema.pre('find', function (next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

UserSchema.pre('findOne', function (next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

UserSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } });
  next();
});
// Create and export the User model
const User = model<TUser, UserModel>('User', UserSchema);
export const Admin = model<TUser, UserModel>('Admin', AdminSchema);

export default User;

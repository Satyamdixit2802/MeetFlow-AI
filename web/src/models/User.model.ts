import mongoose, { Schema, Model } from "mongoose";

import {User} from '@/types/index'

const UserSchema: Schema<User> = new Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
       lowercase: true,
      
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
     
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      min : 6,  
    },

   
  },
   { timestamps: true }
  
);


const UserModel: Model<User> =
  mongoose.models.User || mongoose.model<User>("User", UserSchema);

export default UserModel;
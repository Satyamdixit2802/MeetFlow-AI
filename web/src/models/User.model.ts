import mongoose, { Schema, Model } from "mongoose";

import {User} from '@/types/index'

const UserSchema: Schema<User> = new Schema(
  {
   

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
     
    },

    password: {
      type: String,
      required: false,
      min : 6,  
    },
     name: {
      type: String,
     default : ""
      
       
      
    },
     image: {
      type: String,
     default : ""
      
       
      
    },

   
  },
   { timestamps: true }
  
);


const UserModel: Model<User> =
  mongoose.models.User || mongoose.model<User>("User", UserSchema);

export default UserModel;
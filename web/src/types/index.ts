
import {Types,Document} from "mongoose" ;
import {DefaultSession} from "next-auth"
export interface User extends Document {
    _id: Types.ObjectId;
    email: string;
    name?: string;
    image?: string;
    password?: string;
    createdAt: Date;
    updatedAt: Date;


}

export interface ActionItem extends Document{
    _id: Types.ObjectId;
    task: string;
    owner:string;
    deadline: string;
    status: "Pending" | "in-progress" | "done";
    meetingId: Types.ObjectId
    createdAt: Date;
    updatedAt: Date;
}

export interface Meeting extends Document {
    _id : Types.ObjectId
    title: string;
  transcript: string;
  summary: string;
  userId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
export interface WebhookPayload extends Document{
  title: string;
  transcript: string;
  summary: string;
  action_items: {
    task: string;
    owner: string;
    deadline: string;
  }[];
}

export interface MeetingWithActions extends Meeting {
  actionItems: ActionItem[];
}



declare module "next-auth" {

  interface Session {
    user : {
      id : string
    } & DefaultSession["user"]
  }

  interface User {
    id: string
  }
}
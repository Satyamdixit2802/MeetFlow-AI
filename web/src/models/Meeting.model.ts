import mongoose , {Model, Schema} from 'mongoose'

import {Meeting} from '@/types/index'

const MeetingSchema = new Schema<Meeting>(
    {
        title : {
            type : String,
             required : true,
             trim : true,
             default : 'Untitled Meeting'
        },
        transcript : {
            type : String,
            default: ""
        },
        userId : {
            type : Schema.Types.ObjectId,
            ref: "UserModel",
            required : false
        }
    },
    {timestamps : true}
)

const MeetingModel: Model<Meeting> = mongoose.models.Meeting ?? mongoose.model<Meeting>('Meeting',MeetingSchema);
export default MeetingModel;
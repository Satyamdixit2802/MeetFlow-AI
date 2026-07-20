import mongoose , {Schema, Model} from 'mongoose'
import {ActionItem} from '@/types/index'


const ActionItemSchema = new Schema<ActionItem>(
    {
        task : {
            type : String,
            required : [true,'Task is required'],
            trim : true
        },
        owner : {
            type : String,
            default : "Unassigned",
            trim : true,
        },
        deadline : {
            type : String,
            default : "No Deadline",
        },
        status : {
            type : String,
            enum : ["pending","in-prgress","done"],
            default : "Pending"
        },
        meetingId : {
            type : Schema.Types.ObjectId,
            ref : 'Meeting',
            required : [true,"Meeting is required"]

        }

    },
    {timestamps: true}
)

ActionItemSchema.index({ meetingId: 1 });

const ActionItemModel: Model<ActionItem> =
  mongoose.models.ActionItem ??
  mongoose.model<ActionItem>("ActionItem", ActionItemSchema);

export default ActionItemModel;
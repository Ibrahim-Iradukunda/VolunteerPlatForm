import mongoose, { Schema, Document } from "mongoose"

export interface IComment extends Document {
  opportunityId: mongoose.Types.ObjectId
  volunteerId: mongoose.Types.ObjectId
  volunteerName: string
  content: string
  createdAt: Date
}

const CommentSchema = new Schema<IComment>(
  {
    opportunityId: {
      type: Schema.Types.ObjectId,
      ref: "Opportunity",
      required: true,
    },
    volunteerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    volunteerName: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  }
)

export default mongoose.models.Comment || mongoose.model<IComment>("Comment", CommentSchema)




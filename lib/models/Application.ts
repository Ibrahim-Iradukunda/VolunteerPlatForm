import mongoose, { Schema, Document } from "mongoose"

export interface IApplication extends Document {
  volunteerId: mongoose.Types.ObjectId
  volunteerName: string
  opportunityId: mongoose.Types.ObjectId
  opportunityTitle: string
  status: "pending" | "accepted" | "rejected"
  message: string
  appliedAt: Date
}

const ApplicationSchema = new Schema<IApplication>(
  {
    volunteerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    volunteerName: {
      type: String,
      required: true,
    },
    opportunityId: {
      type: Schema.Types.ObjectId,
      ref: "Opportunity",
      required: true,
    },
    opportunityTitle: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
    message: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
)

// Ensure one application per volunteer per opportunity
ApplicationSchema.index({ volunteerId: 1, opportunityId: 1 }, { unique: true })

export default mongoose.models.Application || mongoose.model<IApplication>("Application", ApplicationSchema)




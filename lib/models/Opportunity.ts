import mongoose, { Schema, Document } from "mongoose"

export interface IOpportunity extends Document {
  organizationId: mongoose.Types.ObjectId
  organizationName: string
  title: string
  description: string
  requirements: string[]
  location: string
  type: "onsite" | "remote" | "hybrid"
  accessibilityFeatures: string[]
  skills: string[]
  status: "pending" | "approved" | "rejected"
  applications: number
  likes: mongoose.Types.ObjectId[]
  comments: mongoose.Types.ObjectId[]
  createdAt: Date
  updatedAt: Date
}

const OpportunitySchema = new Schema<IOpportunity>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    organizationName: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    requirements: {
      type: [String],
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["onsite", "remote", "hybrid"],
      required: true,
    },
    accessibilityFeatures: {
      type: [String],
      default: [],
    },
    skills: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    applications: {
      type: Number,
      default: 0,
    },
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    comments: [
      {
        type: Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
  },
  {
    timestamps: true,
  }
)

// Index for search
OpportunitySchema.index({ title: "text", description: "text", location: "text" })

export default mongoose.models.Opportunity || mongoose.model<IOpportunity>("Opportunity", OpportunitySchema)




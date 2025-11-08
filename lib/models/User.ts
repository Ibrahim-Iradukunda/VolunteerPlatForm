import mongoose, { Schema, Document } from "mongoose"
import bcrypt from "bcryptjs"

export interface IUser extends Document {
  email: string
  password: string
  name: string
  role: "volunteer" | "organization" | "admin"
  createdAt: Date
  comparePassword(candidatePassword: string): Promise<boolean>
}

export interface IVolunteer extends IUser {
  role: "volunteer"
  disabilityStatus?: string
  skills: string[]
  availability: string
  accessibilityNeeds: string[]
}

export interface IOrganization extends IUser {
  role: "organization"
  orgName: string
  contactInfo: string
  description: string
  verified: boolean
}

export interface IAdmin extends IUser {
  role: "admin"
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    name: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["volunteer", "organization", "admin"],
      required: true,
    },
    // Volunteer-specific fields
    disabilityStatus: String,
    skills: [String],
    availability: String,
    accessibilityNeeds: [String],
    // Organization-specific fields
    orgName: String,
    contactInfo: String,
    description: String,
    verified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
)

// Hash password before saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next()
  }
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
  next()
})

// Compare password method
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password)
}

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema)




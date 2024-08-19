import { model, Schema } from "mongoose";
import { TContent } from "./content.interface";

const contentSchema = new Schema<TContent>(
  {
    aboutUs: {
      type: String,
      default: "",
    },
    privacyPolicy: {
      type: String,
      default: "",
    },
    termsAndConditions: {
      type: String,
      default: "",
    },
    support: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

export const Content = model<TContent>("Content", contentSchema);

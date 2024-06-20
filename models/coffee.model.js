import { Schema, model } from "mongoose";

const coffeeSchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    score: { type: Number, min: 0, max: 100 },
    roastLevel: {
      type: String,
      enum: [
        "light roast",
        "medium light roast",
        "medium roast",
        "medium dark roast",
        "dark roast",
        "undrinkable",
      ],
      required: true,
    },
    country: { type: String, required: true },
    type: { type: String, enum: ["arabica", "robusta", "liberica", "excelsa"] },
    farm: { type: String },
    altitude: { type: Number, min: 0, max: 3000 },
    reviews: [{ type: Schema.Types.ObjectId, ref: "Review" }],
    image: {
      type: String,
      default:
        "https://assets-global.website-files.com/642d682a6e4ca0d303c81fdf/65155692e2dc9f25a8fa90a5_ezgif.com-resize.webp",
    },
  },
  {
    timestamps: true,
  }
);

export default model("Coffee", coffeeSchema);

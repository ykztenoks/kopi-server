import express from "express";
import Review from "../models/review.model.js";
import User from "../models/user.model.js";
import Coffee from "../models/coffee.model.js";
import isAuth from "../middleware/authentication.middleware.js";
const router = express.Router();

router.post("/:coffeeId", isAuth, async (req, res) => {
  try {
    const { coffeeId } = req.params;
    const { title, review, rating } = req.body;

    const createdReview = await Review.create({
      title,
      review,
      rating,
      creator: req.user._id,
      coffee: coffeeId,
    });

    await User.findByIdAndUpdate(
      req.user._id,
      { $push: { reviews: createdReview._id } },
      { new: true }
    );

    await Coffee.findByIdAndUpdate(
      coffeeId,
      { $push: { reviews: createdReview._id } },
      { new: true }
    );

    res
      .status(201)
      .json({ message: "review created succesfully", createdReview });
  } catch (error) {
    console.log("error while creating a review", error);
    res.status(500).json(error);
  }
});

router.delete("/:reviewId", isAuth, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const review = await Review.findById(reviewId);

    if (review.creator.toString() !== req.user._id) {
      return res.status(401).json({ message: "You can't delete this review" });
    }

    await Coffee.findByIdAndUpdate(review.coffee, {
      $pull: { reviews: review._id },
    });
    await User.findByIdAndUpdate(review.creator, {
      $pull: { reviews: review._id },
    });

    await Review.findByIdAndDelete(reviewId);

    res.json({ message: "Your review was deleted succesfully" });
  } catch (error) {
    console.log("error while deleting review", error);
    res.status(500).json(error);
  }
});

export default router;

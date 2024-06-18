import express from "express";
import isAuth from "../middleware/authentication.middleware.js";
import isAdmin from "../middleware/admin.middleware.js";
import Coffee from "../models/coffee.model.js";
import Review from "../models/review.model.js";
import User from "../models/user.model.js";

const router = express.Router();

router.post("/", isAuth, isAdmin, async (req, res) => {
  try {
    const { name, score, roastLevel, country, type, farm, altitude } = req.body;
    const coffeeData = {
      name,
      score,
      roastLevel,
      country,
      type,
      farm,
      altitude,
    };
    for (const property in coffeeData) {
      if (!coffeeData[property]) {
        delete coffeeData.property;
      }
    }

    const coffee = await Coffee.create(coffeeData);

    res.status(201).json({ message: "Coffee created succesfuly", coffee });
  } catch (error) {
    console.log("error creating coffee", error);
    res.status(500).json(error);
  }
});

router.get("/all", async (req, res) => {
  try {
    const allCoffees = await Coffee.find().populate("reviews");

    res.json(allCoffees);
  } catch (error) {
    console.log("error fetching all coffees", error);
    res.status(500).json(error);
  }
});

router.get("/:coffeeId", async (req, res) => {
  try {
    const { coffeeId } = req.params;

    const coffee = await Coffee.findById(coffeeId).populate("reviews");

    res.json(coffee);
  } catch (error) {
    console.log("error fetching details single coffee", coffee);
  }
});

router.put("/:coffeeId", isAuth, isAdmin, async (req, res) => {
  try {
    const { coffeeId } = req.params;
    const { name, score, roastLevel, country, type, farm, altitude } = req.body;
    const coffeeData = {
      name,
      score,
      roastLevel,
      country,
      type,
      farm,
      altitude,
    };
    for (const property in coffeeData) {
      if (!coffeeData[property]) {
        delete coffeeData.property;
      }
    }

    const updated = await Coffee.findByIdAndUpdate(coffeeId, coffeeData, {
      new: true,
      runValidators: true,
    });

    res.json({ message: "coffee was updated succesfuly", updated });
  } catch (error) {
    console.log("error editing the coffee", error);
    res.status(500).json(error);
  }
});

router.delete("/:coffeeId", isAuth, isAdmin, async (req, res) => {
  try {
    const { coffeeId } = req.params;
    const coffee = await Coffee.findById(coffeeId).populate("reviews");

    for (const review of coffee.reviews) {
      await User.findByIdAndUpdate(review.creator, {
        $pull: { reviews: review._id },
      });
      await Review.findByIdAndDelete(review._id);
    }

    const deleted = await Coffee.findByIdAndDelete(coffeeId);

    res.json({
      message: deleted.name + " coffee was deleted succesfully",
      deleted,
    });
  } catch (error) {
    console.log("error deleting the coffee", error);
    res.status(500).json(error);
  }
});

export default router;

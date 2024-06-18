import express from "express";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import isAuth from "../middleware/authentication.middleware.js";
import isAdmin from "../middleware/admin.middleware.js";
const router = express.Router();

router.post("/signup", async (req, res) => {
  try {
    const { email, username, password } = req.body;

    //CHECKS IF REQ BODY HAS ALL INFO (email OR username AND password)
    if (!email || !password || !username) {
      return res
        .status(400)
        .json({ message: "Please provide email, username, and password" });
    }

    const foundUser = await User.findOne({ $or: [{ email }, { username }] });

    if (foundUser) {
      return res
        .status(400)
        .json({ message: "The email or username was already taken" });
    }

    // Regex to validate email (checks if theres word@word.com format)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ message: "Provide a valid email address." });
      return;
    }

    // Use regex to validate the password format
    const passwordRegex =
      /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$ %^&*-]).{6,}$/;
    if (!passwordRegex.test(password)) {
      res.status(400).json({
        message:
          "Password must have at least 6 characters and contain at least one number, one lowercase, one uppercase letter and a special character.",
      });
      return;
    }

    const salts = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salts);

    const createdUser = await User.create({
      email,
      username,
      password: hashedPassword,
    });

    res.status(201).json({ message: "User created succesfully", createdUser });
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, username, password } = req.body;
    //CHECKS IF REQ BODY HAS ALL INFO (email OR username AND password)
    if (!(email || username) || !password) {
      return res
        .status(400)
        .json({ message: "Please provide email or username, and password" });
    }

    //CHECK IF USER EXISTS BY LOOKING FOR THEM THROUGH EMAIL OR USERNAME
    const user = await User.findOne({ $or: [{ email }, { username }] });
    if (!user) {
      return res.status(401).json({ message: "User does not exist" });
    }

    //CHECK IF PASSWORD IS CORRECT, USING BCRYPT TO COMPARE USER INPUT AND PASSWORD IN DATABASE
    const passwordCheck = await bcrypt.compare(password, user.password);

    if (!passwordCheck) {
      return res
        .status(401)
        .json({ message: "Email/Username or password incorrect" });
    }
    //DELETE THE USER PASSWORD FROM THE USER VARIABLE SO WE CAN USE THAT AS PAYLOAD
    delete user._doc.password;

    //we use jwt.sign() to creaqte a token upon login
    //to sign we need some info:
    // payload = info to encrypt/encode (user object in this example)
    // the SECRET in the .env file (could have any value, it's like a password)
    // algorithm = just use "HS256"
    // expiresIn = the amount of time in hours that your token will be valid for
    const jwtToken = jwt.sign(
      { payload: user },
      process.env.TOKEN_SIGN_SECRET,
      {
        algorithm: "HS256",
        expiresIn: "24h",
      }
    );

    res.json({ user, jwtToken });
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

router.get("/verify", isAuth, async (req, res) => {
  try {
    res.json({ message: "User is logged in.", user: req.user });
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

router.get("/admin", isAuth, isAdmin, async (req, res) => {
  try {
    res.json({ message: "Admin is logged in and verified.", user: req.user });
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

export default router;

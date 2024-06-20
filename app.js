import express from "express";
import morgan from "morgan";
import connectDB from "./config/mongoose.config.js";
import * as dotenv from "dotenv";
import coffeeRouter from "./routes/coffee.routes.js";
import userRouter from "./routes/user.routes.js";
import reviewRouter from "./routes/review.routes.js";
import cors from "cors";

dotenv.config();

const app = express();
const logger = morgan("dev");

app.use(express.json()); //if you don't do this you don't have access to req.body
app.use(logger);
app.use(
  cors({
    origin: [process.env.REACT_URL],
  })
);
app.use("/user", userRouter);
app.use("/coffee", coffeeRouter);
app.use("/review", reviewRouter);

app.listen(process.env.PORT, () => {
  console.clear();
  console.log("Server 🏃‍♂️on port:", process.env.PORT);
  connectDB();
});

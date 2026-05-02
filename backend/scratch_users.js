import mongoose from "mongoose";
import { ENV } from "./src/lib/env.js";
import User from "./src/models/User.js";

async function run() {
  await mongoose.connect(ENV.MONGO_URI);
  const users = await User.find({}, "email role roleSelected clerkId");
  console.log(users);
  await mongoose.disconnect();
}
run();

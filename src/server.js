import app from "./app.js";
import mongoose from "mongoose";
const PORT = process.env.PORT || 3000;

const connection = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");
  } catch (err) {
    console.log(err);
  }
};

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});

require("dotenv").config();
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const options = {
      // Uncomment and set this if you need a specific write concern
      writeConcern: { w: "majority", j: true },
    };

    await mongoose.connect(process.env.DB_URI, options);
    console.log("Database Connected successfully");
  } catch (error) {
    console.error("Error while connecting with database:", error.message);
  }
};

module.exports = connectDB;

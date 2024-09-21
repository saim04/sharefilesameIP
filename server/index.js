const express = require("express");
const connectDB = require("./databse/connectDB");
const app = express();
const cors = require("cors");
const path = require("path");

app.set("trust proxy", 1);
// DATABASE CONNECTION
connectDB();

// middlewares
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(cors());
app.use("/", require("./routes/routes"));

const PORT = 5000;

if (process.env.NODE_ENV === "production") {
  app.use(express.static("../client/build"));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "client", "build", "index.html"));
  });
}

app.listen(PORT, () => console.log(`Server Started on port ${PORT}`));

const express = require("express");
const cors = require("cors");
const passport = require("passport");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
require("dotenv").config();
require("./config/passport");

const app = express();

// Connect Database
connectDB();

// Middleware
app.use(cors());


app.use(express.json({ limit: '10mb' }));  
app.use(express.urlencoded({ limit: '10mb', extended: true })); 

app.use(passport.initialize());


app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("API is running...");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

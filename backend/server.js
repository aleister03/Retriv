const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

// Load environment variables
dotenv.config();

const connectDB = require('./config/db');
const passport = require('./config/passport');
// Connect to MongoDB
connectDB();

// Initialize Express app
const app = express();

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(passport.initialize());
app.use(express.urlencoded({ extended: true }));

// Test route
app.use('/api/auth', require('./routes/authRoutes'));
app.get('/', (req, res) => res.json({ message: 'Retriv API is running...' }));

// Port
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// backend server for our app
const express = require('express');
const dotenv = require('dotenv');

dotenv.config() //loads environment variables

const connectDB = require('./config/db');
connectDB();
const app = express(); //app initialization

//middleware
app.use(express.json());
app.use(express.urlencoded({extended: true}));

//routes and verify API running
app.get('/', (req, res) => {
    res.json({message: 'Retriv API is running'});
});

const PORT = process.env.PORT || 5000; //server configuration, using port(environment) or 5000(default)

app.listen(PORT, () => { //server initialization
    console.log(`Server is running on port ${PORT}`);
});
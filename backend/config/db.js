// Database configuration using Mongoose to connect to MongoDB
const mongoose = require('mongoose');
const connectDB = async() => {
    try{ //connect to MongoDB using connection URI from .env file
        const conn = await mongoose.connect(process.env.MONGODB_URI, {dbName: 'retriv'});
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    }catch(error){
        console.error(`Error: ${error.message}`);
        process.exit(1); //prevent app from running without database
    }
};
module.exports = connectDB; //exporting the function to server.js
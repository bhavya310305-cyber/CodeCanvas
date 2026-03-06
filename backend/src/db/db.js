const mongoose = require('mongoose');

const connectDb = async () =>{ 
    try{
        await mongoose.connect(process.env.MONGO_URI) 
            console.log('Database is connected successfully');  
        }
    catch(error){
        console.error('Database connection failed:', error);
    }
}
module.exports = connectDb;
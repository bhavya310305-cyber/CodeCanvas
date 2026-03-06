require('dotenv').config();
const app = require('./src/app');
const connectDb = require('./src/db/db');

const PORT = process.env.PORT || 5000;

connectDb()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server is starting at port ${PORT}`);
        });
    })
    .catch((err) => {
        console.log("Database connection failed:", err);
    });


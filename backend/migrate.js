const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const result = await mongoose.connection.db.collection('snippets').updateMany(
    { userId: { $in: [null, undefined] } },
    { $set: { userId: new mongoose.Types.ObjectId('69ad2b1603164269f5faf07b') } }
  );
  console.log('Fixed snippets:', result.modifiedCount);
  mongoose.disconnect();
});

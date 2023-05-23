const mongoose = require('mongoose');

// const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ChatOnline_Users';
const user = 'jaime';
const password = 'Jamesjuarez27';
const dbName = 'Restaurant';
const MONGODB_URI = process.env.MONGODB_URI || `mongodb+srv://${user}:${password}@cluster0.zs5j7rn.mongodb.net/${dbName}?retryWrites=true&w=majority`;

const connection = () => {
    mongoose.set('strictQuery', false);
    mongoose.Promise = global.Promise;
    console.log('Connecting to MongoDB... ' + MONGODB_URI);
    module.exports = mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true, family: 4 }).then(() => {
        console.log('Connected to MongoDB');
    }).catch((err) => {
        console.log('Error connecting to MongoDB: ' + err);
    });
}

connection();

module.exports = connection;
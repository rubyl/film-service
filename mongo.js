const MongoClient = require('mongodb').MongoClient;
const MONGO_URL = "mongodb://localhost:27017/rubylim";


module.exports = function(app) {
  MongoClient.connect(MONGO_URL, {
      useNewUrlParser: true
    })
    .then((client) => {
      const db = client.db('rubylim');
      app.film = db.collection('film');
      console.log('Database connection established')
    })
    .catch((err) => console.error(err))
};
const express = require('express');
const app = express();
const MongoClient = require('mongodb').MongoClient;
const cors = require('cors');
const fileUpload = require('express-fileupload');
const port = 5055;
require('dotenv').config()

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(fileUpload());

app.get('/', (req, res) => {
  res.send('Hello World!')
})

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wgngx.mongodb.net/${process.env.DB_DATABASE}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

client.connect(err => {
  const serviceCollection = client.db(`${process.env.DB_DATABASE}`).collection(`${process.env.DB_COLLECTION}`);
  // perform actions on the collection object
 //  client.close();
});


app.listen(process.env.PORT || port);
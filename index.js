const express = require('express');
const app = express();
const MongoClient = require('mongodb').MongoClient;
const cors = require('cors');
const bodyParser = require('body-parser')
const ObjectId = require('mongodb').ObjectId;
const fs = require('fs-extra');
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
  const serviceCollection = client.db(`${process.env.DB_DATABASE}`).collection(`${process.env.DB_SERVICES}`);

  const reviewCollection = client.db(`${process.env.DB_DATABASE}`).collection(`${process.env.DB_REVIEWS}`);

  const bookingCollection = client.db(`${process.env.DB_DATABASE}`).collection(`${process.env.DB_BOOK}`);

  const adminCollection = client.db(`${process.env.DB_DATABASE}`).collection(`${process.env.DB_ADMIN}`);
  // perform actions on the collection object
  // add service items
  app.post('/addService', (req, res) => {
    const file = req.files.file;
    const title = req.body.title;
    const price = req.body.price;
    const description = req.body.description;
    const filePath = `${__dirname}/services/${file.name}`;
    file.mv(filePath, err => {
      if (err) {
        console.log(err);
        res.status(500).send({ msg: 'Failed to upload' });
      }
      const newImg = fs.readFileSync(filePath);
      const encImg = newImg.toString('base64');

      var image = {
        contentType: req.files.file.mimetype,
        size: req.files.file.size,
        img: Buffer(encImg, 'base64')
      }

      serviceCollection.insertOne({ title, price, description, image })
        .then(result => {
          fs.remove(filePath, error => {
            if (error) {
              console.log(err);
              res.status(500).send({ msg: 'Failed to upload' });
            }
            res.send(result.insertedCount > 0);
          })
        })
    })
  })

  // get all services
  app.get('/getServices', (req, res) => {
    serviceCollection.find({})
      .toArray((err, doc) => {
        res.send(doc);
      })
  })

  // add review to database
  app.post('/addReview', (req, res) => {
    const email = req.body.email;
    const description = req.body.description;
    const occupation = req.body.occupation;
    const rating = req.body.rating;
    const image = req.body.image;
    reviewCollection.insertOne({ email, description, occupation, rating, image })
      .then(result => {
        res.send(result.insertedCount > 0)
      })
  })

  // get all reviews
  app.get('/getReview', (req, res) => {
    reviewCollection.find({})
      .toArray((err, doc) => {
        res.send(doc);
      })
  })

  // store booking 
  app.post("/addBook", (req, res) => {
    const email = req.body.email;
    const title = req.body.title;
    const price = req.body.price;
    const paymentId = req.body.id;
    bookingCollection.insertOne({ email, title, price, paymentId })
      .then(result => {
        res.send(result.insertedCount > 0)
      })
  })

  // fetching booking by filtering email
  app.get('/getBooking', (req, res) => {
    const email = req.query.email
    bookingCollection.find({ email: `${email}` })
      .toArray((err, doc) => {
        res.send(doc)
      })
  })

  // fetching booking
  app.get('/getAllBookingList', (req, res) => {
    const email = req.query.email
    bookingCollection.find({})
      .toArray((err, doc) => {
        res.send(doc)
      })
  })

  // create admin
  app.post('/addAdmin', (req, res) => {
    const email = req.body.email;
    adminCollection.insertOne({email})
    .then(result => {
      res.send(result.insertedCount > 0);
    })
  })

  // admin fetching
  app.get('/getAdmin',(req,res)=>{
    const email = req.query;
    adminCollection.find(email)
    .toArray((err,doc)=>{
      res.send(doc.length>0);
    })
  })

  // service delete
  app.get('/serviceDelete',(req, res)=>{
    const id = req.query.id;
    serviceCollection.deleteOne({_id: ObjectId(id)})
    .then(result=>{
      res.send(result.deletedCount > 0);
    })
  })

  //  client.close();
});


app.listen(process.env.PORT || port);
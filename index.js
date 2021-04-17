const express = require('express');
const app = express();
const MongoClient = require('mongodb').MongoClient;
const cors = require('cors');
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
  // perform actions on the collection object
  // add service items
  app.post('/addService', (req, res) => {
      const file = req.files.file;
      const title = req.body.title;
      const price = req.body.price;
      const description = req.body.description;
      const filePath = `${__dirname}/services/${file.name}`;
      file.mv(filePath, err => {
          if(err){
              console.log(err);
              res.status(500).send({msg: 'Failed to upload'});
          }
          const newImg = fs.readFileSync(filePath);
          const encImg = newImg.toString('base64');

          var image = {
              contentType: req.files.file.mimetype,
              size: req.files.file.size,
              img: Buffer(encImg, 'base64')
          }

          serviceCollection.insertOne({title, price, description, image})
          .then(result => {
              fs.remove(filePath, error => {
                  if(error){
                    console.log(err);
                    res.status(500).send({msg: 'Failed to upload'});
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


 //  client.close();
});


app.listen(process.env.PORT || port);
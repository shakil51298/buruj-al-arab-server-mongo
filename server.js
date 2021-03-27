// express
const express = require('express')

// body parser middlewear
const bodyParser = require('body-parser')

// firebase auth
const admin = require('firebase-admin');

// middle wear cors
const cors = require('cors')

// environment veriable
require('dotenv').config()

// connet to mongodb
const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.bptoi.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const port = 3001

// firebase service account
var serviceAccount = require("./buruij-al-arab-after-auth-firebase-adminsdk-8kyss-8018b83b04.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});


// using all of
const app = express()
app.use(cors());
app.use(bodyParser.json());


// saving doc to mongodb
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const collection = client.db("Birij-al-arab").collection("bookings");
  
  // CRUD OPERATION
  // 1 ==> Create
  app.post('/addbooking', (req, res) => {
    const addbookingRequest = req.body;
    // saving data to db
    collection.insertOne(addbookingRequest)
      .then(result => {
        res.send(result.insertedCount > 0)
      })
    console.log(addbookingRequest);
  })
  // ==>  READ
  app.get("/bookings", (req, res) => {
    // veryfying user
    const bearer = req.headers.authorization;
    if (bearer && bearer.startsWith('Bearer')) {
      const idToken = bearer.split(' ')[1];
      admin.auth()
        .verifyIdToken(idToken)
        .then((decodedToken) => {
          const tokenEmial = decodedToken.email;
          if (tokenEmial === req.query.email) {
            collection.find({ email: req.query.email })
              .toArray((err, doc) => {
                res.status(200).send(doc)
              })
          }
          else {
            res.status(401).send("Un-authorized Request 401")
          }
        })
        .catch((error) => {
          res.status(401).send("Un-authorized Request 401")
        });
    }
    else {
      res.status(401).send("Un-authorized Request 401")
    }
  })
});


app.get('/', (req, res) => {
  res.send('Hello World!')
})

// port
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
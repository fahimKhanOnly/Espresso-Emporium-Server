const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
require('dotenv').config();

const port = process.env.PORT || 5000;


// Middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.SECRET_KEY}@cluster0.hhplj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const coffeeDB = client.db('coffeeDB')
    const database = coffeeDB.collection("coffee");

    const usersDB = client.db('coffeeDB').collection("usersDB");

    app.post("/coffee", async (req, res) => {
      const data = req.body;
      const result = await database.insertOne(data);
      console.log(result);
      res.send(result);
    })

    app.get("/coffee", async (req, res) => {
      const result = await database.find().toArray();
      res.send(result);
    })

    app.delete('/coffee/:id', async (req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId((id))};
      const result = database.deleteOne(query);
      res.send(result);
    })

    app.get('/coffee/:id', async (req, res) => {
      let id = req.params.id;
      let query = {_id: new ObjectId(id)};
      let result = await database.findOne(query);
      res.send(result);
    })

    app.put('/coffee/:id', async (req, res) => {
      const id = req.params.id;
      const {name, supplier, chef, taste, details, category, photo} = req.body;
      const query = {_id: new ObjectId(id)};
      const option = {upsert: true};
      const latestData = {
        $set: {
          name: name,
          chef: chef,
          supplier: supplier,
          taste: taste,
          category: category,
          details: details,
          photo: photo,
        }
      }
      const result = await database.updateOne(query, latestData, option);
      res.send(result);      
      console.log(latestData);
    })



    // Users API
    app.post("/users", async (req, res) => {
      const newUser = req.body;
      const result = await usersDB.insertOne(newUser);
      console.log(result);
      res.send(result);
    })


    app.get("/users", async (req, res) => {
      const cursor = usersDB.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    app.delete("/users/:id", async (req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await usersDB.deleteOne(query);
      res.send(result);
    })


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send("Coffee is making.");
})

app.listen(port, () => {
  console.log(`Coffee server is running on port ${port}`);
})

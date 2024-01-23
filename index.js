const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();

// middleware
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 5001;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.cgopplb.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  

  try {
    await client.connect();

    const taskCollection = client.db("taskDB").collection("tasks");
    const UserCollection = client.db("taskDB").collection("users");
    const commentCollection = client.db("taskDB").collection("comments");

    app.get("/tasks", async (req, res) => {
        const userEmail = req.query.user; // Assuming userEmail is a string
        const result = await taskCollection.find().toArray();
        console.log(result);
        res.send(result);
      });
      app.get("/tasks/:email", async (req, res) => {
        const email = req.params.email;
        const query = { email: email };
          const result = await taskCollection.find(query).toArray();
          console.log(result);
          res.send(result);
        });
      app.get('/tasks/:id', async (req, res) => {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) }
        const result = await taskCollection.findOne(query);
        res.send(result);
      })
   

    app.post("/tasks", async (req, res) => {
      try {
        const body = req.body;
        const result = await taskCollection.insertOne(body);
        console.log(result);
        res.send(result);
      } catch (error) {
        console.log(error);
        res.status(500).send(error);
      }
    });
    app.get('/users', async (req, res) => {
      const result = await UserCollection.find().toArray();
      res.send(result);
    });
  
    app.post('/users', async (req, res) => {
      const user = req.body;
     
      const query = { email: user.email }
      const existingUser = await UserCollection.findOne(query);
      if (existingUser) {
        return res.send({ message: 'user already exists', insertedId: null })
      }
      const result = await UserCollection.insertOne(user);
      res.send(result);
    });
  

    app.patch('/tasks/:id', async (req, res) => {
      const item = req.body;
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) }
      const updatedDoc = {
        $set: {
          status:item.status
      }
    }

      const result = await taskCollection.updateOne(filter, updatedDoc);
      res.send(result);
    })


    app.put('/tasks/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) }
      const options = { upsert: true };
      const updatedTask = req.body;
    
      const products = {
          $set: {
    
              title: updatedTask.title,
              description: updatedTask.description,
              deadline: updatedTask.deadline,
              priority: updatedTask.priority,
             
             
          }
      }
    
      const result = await taskCollection.updateOne(filter, products, options);
      res.send(result);
    })

    app.delete('/tasks/:id', async (req, res) => {
      try{
          const id = req.params.id;
          const query = { _id: new ObjectId(id) }
          const result = await taskCollection.deleteOne(query);
          res.send(result);
      } catch(error)
      {
          console.log(error)
      }
        
    })
    

    app.get("/comments", async (req, res) => {
   
      const result = await commentCollection.find().toArray();
      console.log(result);
      res.send(result);
    });

    app.post("/comments", async (req, res) => {
      try {
        const body = req.body;
        const result = await commentCollection.insertOne(body);
        console.log(result);
        res.send(result);
      } catch (error) {
        console.log(error);
        res.status(500).send(error);
      }
    });

    console.log("Connected to MongoDB successfully!");
  } finally {
    // Ensure that the client will close when you finish/error
    // await client.close();
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Crud is running .....");
});

app.listen(port, () => {
  console.log(`App is running on port ${port}`);
});

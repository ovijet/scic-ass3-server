const dns = require("node:dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);


// Load environment variables
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
dotenv.config();
const port = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB URI
const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error("❌ MONGODB_URI is missing in .env file");
  process.exit(1);
}

// MongoDB Client
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// Connect Database
async function connectToMongoDB() {
  try {
    await client.connect();
    console.log("🎉 Successfully connected to MongoDB");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error);
    process.exit(1);
  }
}

// Main Function
async function startServer() {
  await connectToMongoDB();

  const db = client.db("bookStoreDB");

  // Collection Example
  const booksCollection = db.collection("books");

  // Home Route
  app.get("/", (req,res) => {
    res.send("📚 DigiTools Book Store Server is Running!");
  });


  app.post("/addBook", async (req, res) => {
  try {
    const book = req.body;
    const result = await booksCollection.insertOne(book);
    res.json({ success: true, insertedId: result.insertedId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get("/addBook", async (req, res) => {
  const result = await booksCollection.find().toArray();
  res.json(result);
});

app.get("/addBook/:id",async (req, res) => {
  try {
    const { id } = req.params;
    const result = await booksCollection.findOne({ _id: new ObjectId(id) });
    if (!result) {
      return res.status(404).send({ message: "Book not found" });
    }
    res.send(result);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

  


 

  // Start Server
  app.listen(port, () => {
    console.log(`🚀 Server running on http://localhost:${port}`);
  });
}

startServer();

// Gracefully Close MongoDB Connection
process.on("SIGINT", async () => {
  await client.close();
  console.log("🔌 MongoDB connection closed.");
  process.exit(0);
});
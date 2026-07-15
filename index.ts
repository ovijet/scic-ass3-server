import dns from "node:dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);

import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { MongoClient, ServerApiVersion, ObjectId, Collection, Document } from "mongodb";

// Load environment variables
dotenv.config();
const app = express();
const port: string | number = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB URI
const uri: string | undefined = process.env.MONGODB_URI;

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
async function connectToMongoDB(): Promise<void> {
  try {
    await client.connect();
    console.log("🎉 Successfully connected to MongoDB");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error);
    process.exit(1);
  }
}

// Main Function
async function startServer(): Promise<void> {
  await connectToMongoDB();

  const db = client.db("bookStoreDB");

  // Collection (You can create a specific interface for Book instead of Document if needed)
  const booksCollection: Collection<Document> = db.collection("books");

  // Home Route
  app.get("/", (req: Request, res: Response) => {
    res.send("📚 DigiTools Book Store Server is Running!");
  });

  // POST: Add a new book
  app.post("/addBook", async (req: Request, res: Response): Promise<void> => {
    try {
      const book = req.body;
      const result = await booksCollection.insertOne(book);
      res.json({ success: true, insertedId: result.insertedId });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // GET: Get all books (Note: Your code had duplicate GET /addBook routes. I merged them or kept the standard list one here)
  app.get("/addBook", async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await booksCollection.find().toArray();
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // GET: Get a specific book by ID
  app.get("/addBook/:id", async (req: Request, res: Response): Promise<any> => {
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

  // DELETE: Delete a book by ID
  app.delete("/addBook/:id", async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params.id;
      const result = await booksCollection.deleteOne({ _id: new ObjectId(id) });
      res.send(result);
    } catch (error) {
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
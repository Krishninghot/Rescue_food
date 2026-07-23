import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongoServer;

export async function connectDB() {
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      retryWrites: false,
    });
    console.log(`MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    console.warn(
      "Primary MongoDB connection failed, falling back to in-memory MongoDB:",
      err.message,
    );

    try {
      if (!mongoServer) {
        mongoServer = await MongoMemoryServer.create();
      }

      const conn = await mongoose.connect(mongoServer.getUri(), {
        dbName: "food-rescue-network",
      });
      console.log(`MongoDB connected (memory): ${conn.connection.host}`);
      return conn;
    } catch (memoryErr) {
      console.error("MongoDB connection failed:", memoryErr.message);
      process.exit(1);
    }
  }
}

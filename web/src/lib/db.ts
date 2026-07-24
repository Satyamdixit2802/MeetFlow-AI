import mongoose from "mongoose";

type connectionObject = {
  isconnected?: number;
};

const connection: connectionObject = {};

async function dbConnect(): Promise<void> {
  if (connection.isconnected) {
    console.log("Already connected to database");
    return;
  }

  const mongoUri = process.env.MONGO_URI || process.env.DATABASE_URL;

  if (!mongoUri) {
    throw new Error(
      "Missing MongoDB connection string. Set MONGO_URI or DATABASE_URL in your environment."
    );
  }

  try {
    const db = await mongoose.connect(mongoUri);
    connection.isconnected = db.connections[0].readyState;
    console.log("Connected to database successfully", connection.isconnected);
  } catch (error) {
    console.error("Error connecting to database:", error);
    throw error;
  }
}

export default dbConnect;
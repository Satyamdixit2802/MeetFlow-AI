import mongoose from "mongoose"


type connectionObject = {
    isconnected ?: number;
}

const connection : connectionObject = {};

async function dbConnect(): Promise<void> {
    if(connection.isconnected){
        console.log("Already connected to database");
        return ;
        
    }

    try {
        const db = await mongoose.connect(process.env.MONGO_URI!)
        connection.isconnected = db.connections[0].readyState;
           console.log("Connected to database successfully",connection.isconnected);
    }
    catch(error) {
         console.log("Error connecting to database:",error);
        process.exit(1)
    }
}

export default dbConnect ;
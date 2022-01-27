var mongo = require('mongodb');
const { MongoClient } = require("mongodb");
const mySecret = process.env['MONGO_PASSWORD']


const uri =
  `mongodb+srv://MadhushreeKunder:${mySecret}@cluster0.5ibu9.mongodb.net/video-library?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    // connecting to server
    await client.connect();
    const database = client.db('video-library'); // selecting DB
    const videos = database.collection('videos'); // selecting the collection
    
    // Add a document to videos
    const newVideo = { name: "japani video",  price: 1500 }
    const result = await videos.insertOne(newVideo);
    console.log(
      `${result.insertedCount} documents were inserted with the _id: ${result.insertedId}`,
    );

    
    // Query for a product that has the name 'japani video'
    const query = { name: 'japani video' };
    const video = await videos.findOne(query);
    console.log("found one", video);


  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);
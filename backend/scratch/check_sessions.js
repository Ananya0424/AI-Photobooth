const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "../.env") });

const SessionSchema = new mongoose.Schema({
  sessionId: String,
  userName: String,
  email: String,
  phone: String,
  gender: String,
  selectedTemplate: {
    id: String,
    name: String,
    imageUrl: String
  },
  rawUserImageUrl: String,
  generatedImageUrl: String,
  status: String,
  errorMessage: String,
  createdAt: { type: Date, default: Date.now }
});

const Session = mongoose.model("Session", SessionSchema);

async function run() {
  console.log("Connecting to MongoDB:", process.env.MONGODB_URI);
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB!");

    const sessions = await Session.find().sort({ createdAt: -1 }).limit(10);
    console.log(`\nLast ${sessions.length} sessions:`);
    sessions.forEach(s => {
      console.log(`- ID: ${s.sessionId}`);
      console.log(`  User: ${s.userName}`);
      console.log(`  Gender: ${s.gender}`);
      console.log(`  Template: ${s.selectedTemplate?.name} (${s.selectedTemplate?.id})`);
      console.log(`  Status: ${s.status}`);
      if (s.errorMessage) {
        console.log(`  Error: ${s.errorMessage}`);
      }
      console.log(`  Created: ${s.createdAt}`);
      console.log(`  Generated Image: ${s.generatedImageUrl || "N/A"}`);
      console.log("-----------------------------------------");
    });
  } catch (err) {
    console.error("Database error:", err);
  } finally {
    await mongoose.disconnect();
  }
}

run();

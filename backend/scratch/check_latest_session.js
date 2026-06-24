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
  selectedModel: String,
  generatedPrompt: String,
  generationDuration: Number,
  createdAt: { type: Date, default: Date.now }
});

const Session = mongoose.model("Session", SessionSchema);

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const session = await Session.findOne({ sessionId: "e2bc4d06-c8a7-46dd-b3df-d99ecf6ce73d" });
    console.log(JSON.stringify(session, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

run();

const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "../.env") });

const SessionSchema = new mongoose.Schema({
  sessionId: String,
  status: String,
  errorMessage: String,
  createdAt: Date
});

const Session = mongoose.model("Session", SessionSchema);

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Group by status
    const stats = await Session.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);
    console.log("Session Status Stats:", stats);

    // Get last 10 failed sessions
    const failures = await Session.find({ status: "failed" }).sort({ createdAt: -1 }).limit(10);
    console.log(`\nLast ${failures.length} failed sessions:`);
    failures.forEach(f => {
      console.log(`- ID: ${f.sessionId}, Error: ${f.errorMessage}, Created: ${f.createdAt}`);
    });
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

run();

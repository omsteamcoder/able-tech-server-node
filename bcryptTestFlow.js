import bcrypt from 'bcrypt';
import mongoose from 'mongoose';

const MONGO_URI = 'your_mongo_connection_string_here';
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});
const User = mongoose.model('User', userSchema);

const testEmail = 'test@example.com';
const testPassword = '123456';

async function registerUser() {
  const hashedPassword = await bcrypt.hash(testPassword, 10);
  console.log("Generated hash for registration:", hashedPassword);

  const user = new User({ email: testEmail, password: hashedPassword });
  await user.save();
  console.log("User registered successfully with hashed password.");
}

async function loginUser() {
  const user = await User.findOne({ email: testEmail });
  if (!user) {
    console.log("User not found");
    return;
  }

  console.log("Stored hashed password from database:", user.password);

  const isMatch = await bcrypt.compare(testPassword, user.password);
  console.log("Password comparison result in login:", isMatch);
}

async function runTest() {
  await mongoose.connection.dropDatabase(); // Clear existing data
  await registerUser();  // Register user with hashed password
  await loginUser();     // Attempt login to verify password comparison
  mongoose.connection.close();
}

runTest().catch(err => console.error("Error in test flow:", err));

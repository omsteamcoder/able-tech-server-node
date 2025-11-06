import bcrypt from 'bcrypt';

const testPassword = '123456';

// Step 1: Hash the password
bcrypt.hash(testPassword, 10, (err, hash) => {
  if (err) throw err;
  console.log("Generated hash:", hash);

  // Step 2: Attempt to compare the plain text password with the generated hash
  bcrypt.compare(testPassword, hash, (compareErr, isMatch) => {
    if (compareErr) throw compareErr;
    console.log("Password comparison result:", isMatch); // Should be `true`
  });
});

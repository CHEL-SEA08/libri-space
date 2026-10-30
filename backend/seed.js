
require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
const Book = require("./models/Book");

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");

    const email = "admin@library.com";
    let admin = await User.findOne({ email });

    if (!admin) {
      const hashedPassword = await bcrypt.hash("Admin@12345", 10);

      admin = await User.create({
        name: "Library Admin",
        email,
        password: hashedPassword,
        role: "admin"
      });

      console.log("Demo admin created");
    } else {
      console.log("Demo admin already exists");
    }

    const count = await Book.countDocuments();

    if (count === 0) {
      await Book.insertMany([
        {
          title: "Wings of Fire",
          author: "A. P. J. Abdul Kalam",
          category: "Biography",
          isbn: "LIB-1001",
          totalCopies: 5,
          availableCopies: 5
        },
        {
          title: "The Alchemist",
          author: "Paulo Coelho",
          category: "Fiction",
          isbn: "LIB-1002",
          totalCopies: 4,
          availableCopies: 4
        },
        {
          title: "Introduction to Algorithms",
          author: "Thomas H. Cormen",
          category: "Computer Science",
          isbn: "LIB-1003",
          totalCopies: 3,
          availableCopies: 3
        },
        {
          title: "Clean Code",
          author: "Robert C. Martin",
          category: "Programming",
          isbn: "LIB-1004",
          totalCopies: 2,
          availableCopies: 2
        }
      ]);

      console.log("Sample books added");
    } else {
      console.log("Books already exist; skipping sample data");
    }

    console.log("Seeding completed");
  } catch (error) {
    console.error("Seeding failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

seed();

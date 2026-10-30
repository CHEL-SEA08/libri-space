
const express = require("express");
const Book = require("../models/Book");
const Transaction = require("../models/Transaction");
const {
  authMiddleware,
  adminOnly
} = require("../middleware/authMiddleware");

const router = express.Router();

// List and search books
router.get("/", async (req, res) => {
  try {
    const search = (req.query.search || "").trim();

    const filter = search
      ? {
          $or: [
            { title: { $regex: search, $options: "i" } },
            { author: { $regex: search, $options: "i" } },
            { category: { $regex: search, $options: "i" } }
          ]
        }
      : {};

    const books = await Book.find(filter).sort({ title: 1 });
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add a book
router.post("/", authMiddleware, adminOnly, async (req, res) => {
  try {
    const {
      title,
      author,
      category,
      isbn,
      totalCopies
    } = req.body;

    if (!title || !author) {
      return res.status(400).json({
        message: "Title and author are required"
      });
    }

    const copies = Number(totalCopies ?? 1);

    if (!Number.isInteger(copies) || copies < 1) {
      return res.status(400).json({
        message: "Copies must be a positive whole number"
      });
    }

    const book = await Book.create({
      title,
      author,
      category,
      isbn: isbn || undefined,
      totalCopies: copies,
      availableCopies: copies
    });

    res.status(201).json(book);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update a book
router.put("/:id", authMiddleware, adminOnly, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        message: "Book not found"
      });
    }

    const { title, author, category, isbn, totalCopies } = req.body;

    if (title !== undefined) book.title = title;
    if (author !== undefined) book.author = author;
    if (category !== undefined) book.category = category;
    if (isbn !== undefined) book.isbn = isbn || undefined;

    if (totalCopies !== undefined) {
      const copies = Number(totalCopies);
      const currentlyIssued = book.totalCopies - book.availableCopies;

      if (
        !Number.isInteger(copies) ||
        copies < currentlyIssued ||
        copies < 0
      ) {
        return res.status(400).json({
          message: "Total copies cannot be less than copies issued"
        });
      }

      book.totalCopies = copies;
      book.availableCopies = copies - currentlyIssued;
    }

    await book.save();
    res.json(book);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a book
router.delete("/:id", authMiddleware, adminOnly, async (req, res) => {
  try {
    const activeTransaction = await Transaction.findOne({
      book: req.params.id,
      status: "issued"
    });

    if (activeTransaction) {
      return res.status(400).json({
        message: "Cannot delete a book that is currently issued"
      });
    }

    const book = await Book.findByIdAndDelete(req.params.id);

    if (!book) {
      return res.status(404).json({
        message: "Book not found"
      });
    }

    res.json({ message: "Book deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

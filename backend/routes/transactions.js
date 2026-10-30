
const express = require("express");
const Book = require("../models/Book");
const Transaction = require("../models/Transaction");
const {
  authMiddleware,
  adminOnly
} = require("../middleware/authMiddleware");

const router = express.Router();

const LOAN_DAYS = 14;
const FINE_PER_DAY = 5;

// Issue a book to a member
router.post(
  "/issue",
  authMiddleware,
  adminOnly,
  async (req, res) => {
    try {
      const { userId, bookId } = req.body;

      const User = require("../models/User");
      const user = await User.findById(userId);
      const book = await Book.findById(bookId);

      if (!user || user.role !== "member") {
        return res.status(404).json({
          message: "Member not found"
        });
      }

      if (!book) {
        return res.status(404).json({
          message: "Book not found"
        });
      }

      if (book.availableCopies < 1) {
        return res.status(400).json({
          message: "No copies available"
        });
      }

      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + LOAN_DAYS);

      const transaction = await Transaction.create({
        user: user._id,
        book: book._id,
        dueDate
      });

      book.availableCopies -= 1;
      await book.save();

      res.status(201).json({
        message: "Book issued successfully",
        transaction
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// View the logged-in member's borrowing history
router.get("/my", authMiddleware, async (req, res) => {
  try {
    const transactions = await Transaction.find({
      user: req.user._id
    })
      .populate("book")
      .sort({ issueDate: -1 });

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// View all borrowing records (admin)
router.get(
  "/",
  authMiddleware,
  adminOnly,
  async (req, res) => {
    try {
      const transactions = await Transaction.find()
        .populate("user", "name email")
        .populate("book", "title author")
        .sort({ issueDate: -1 });

      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Return a book (admin)
router.post(
  "/:id/return",
  authMiddleware,
  adminOnly,
  async (req, res) => {
    try {
      const transaction = await Transaction.findById(req.params.id);

      if (!transaction) {
        return res.status(404).json({
          message: "Transaction not found"
        });
      }

      if (transaction.status === "returned") {
        return res.status(400).json({
          message: "This book has already been returned"
        });
      }

      const now = new Date();
      const overdueMs = now.getTime() - transaction.dueDate.getTime();
      const overdueDays = Math.max(
        0,
        Math.ceil(overdueMs / (1000 * 60 * 60 * 24))
      );

      transaction.returnDate = now;
      transaction.fine = overdueDays * FINE_PER_DAY;
      transaction.status = "returned";

      const book = await Book.findById(transaction.book);

      if (book) {
        book.availableCopies = Math.min(
          book.totalCopies,
          book.availableCopies + 1
        );
        await book.save();
      }

      await transaction.save();

      res.json({
        message: "Book returned successfully",
        fine: transaction.fine,
        transaction
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

module.exports = router;

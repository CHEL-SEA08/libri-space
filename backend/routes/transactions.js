
const express = require("express");
const mongoose = require("mongoose");

const Book = require("../models/Book");
const User = require("../models/User");
const Transaction = require("../models/Transaction");

const {
  authMiddleware,
  adminOnly
} = require("../middleware/authMiddleware");

const router = express.Router();

const LOAN_DAYS = 14;
const FINE_PER_DAY = 5;

// ISSUE A BOOK
// Admin can issue to a selected member.
// Members can issue books to themselves.
router.post("/issue", authMiddleware, async (req, res) => {
  try {
    const { bookId, userId } = req.body;

    if (!bookId || !mongoose.Types.ObjectId.isValid(bookId)) {
      return res.status(400).json({
        message: "A valid Book ID is required"
      });
    }

    let targetUserId;

    if (req.user.role === "admin") {
      if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({
          message: "A valid Member User ID is required"
        });
      }

      const member = await User.findById(userId);

      if (!member || member.role !== "member") {
        return res.status(404).json({
          message: "Member not found"
        });
      }

      targetUserId = member._id;
    } else if (req.user.role === "member") {
      // A member can issue only to themselves.
      targetUserId = req.user._id;
    } else {
      return res.status(403).json({
        message: "You are not allowed to issue books"
      });
    }

    const book = await Book.findById(bookId);

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

    // Prevent the same member from borrowing
    // the same book again while it is still issued.
    const existingTransaction = await Transaction.findOne({
      user: targetUserId,
      book: bookId,
      status: "issued"
    });

    if (existingTransaction) {
      return res.status(400).json({
        message: "This member has already borrowed this book"
      });
    }

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + LOAN_DAYS);

    // Reduce available copies safely.
    const updatedBook = await Book.findOneAndUpdate(
      {
        _id: bookId,
        availableCopies: { $gt: 0 }
      },
      {
        $inc: { availableCopies: -1 }
      },
      { new: true }
    );

    if (!updatedBook) {
      return res.status(400).json({
        message: "No copies available"
      });
    }

    try {
      const transaction = await Transaction.create({
        user: targetUserId,
        book: bookId,
        dueDate
      });

      return res.status(201).json({
        message: "Book issued successfully",
        transaction
      });
    } catch (error) {
      // Restore the copy if transaction creation fails.
      await Book.findByIdAndUpdate(bookId, {
        $inc: { availableCopies: 1 }
      });

      throw error;
    }

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});


// MEMBER: VIEW OWN BORROWING HISTORY
router.get("/my", authMiddleware, async (req, res) => {
  try {
    const transactions = await Transaction.find({
      user: req.user._id
    })
      .populate("book")
      .sort({ issueDate: -1 });

    res.json(transactions);

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});


// ADMIN: VIEW ALL TRANSACTIONS
router.get("/", authMiddleware, adminOnly, async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate("user", "name email")
      .populate("book", "title author")
      .sort({ issueDate: -1 });

    res.json(transactions);

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});


// ADMIN: RETURN A BOOK
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

      const overdueMs =
        now.getTime() - new Date(transaction.dueDate).getTime();

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
      res.status(500).json({
        message: error.message
      });
    }
  }
);

module.exports = router;

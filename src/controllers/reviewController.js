const Review = require('../models/Review');

exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find().select('custId orderId rating comment date');
    return res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (err) {
    console.error("Error fetching reviews:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

exports.createReview = async (req, res) => {
    try {
        const { custId, orderId, rating, comment } = req.body;
        const newReview = new Review({
            custId,
            orderId,
            rating,
            comment,
        });
        await newReview.save();
        return res.status(201).json({ success: true, data: newReview });
    } catch (err) {
        console.error("Error creating review:", err);
        return res.status(500).json({ success: false, error: err.message });
    }
};

exports.editReview = async (req, res) => {
    try {
        const { orderId, rating, comment } = req.body;
        const updatedReview = await Review.findOneAndUpdate(
            {orderId},
            { rating, comment },
            { new: true }
        );
        console.log(updatedReview)
        if (!updatedReview) {
            return res.status(404).json({ success: false, error: "Review not found" });
        }
        return res.status(200).json({ success: true, data: updatedReview });
    } catch (err) {
        console.error("Error editing review:", err);
        return res.status(500).json({ success: false, error: err.message });
    }
};
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
        const { custId, orderId, rating, review } = req.body;

        if (!custId || !orderId) {
            return res.status(400).json({ success: false, error: "custId and orderId are required" });
        }

        // Check existing review
        const existing = await Review.findOne({ custId, orderId });

        if (existing) {
            existing.rating = rating;
            existing.review = review;

            const updatedReview = await existing.save();

            return res.status(200).json({
                success: true,
                message: "Review updated",
                data: updatedReview
            });
        }

        // Create new review
        const newReview = await Review.create({
            custId,
            orderId,
            rating,
            review,
            createdAt: new Date()
        });

        return res.status(201).json({
            success: true,
            message: "Review created",
            data: newReview
        });

    } catch (err) {
        console.error("Error creating/updating review:", err);
        return res.status(500).json({ success: false, error: err.message });
    }
};


exports.editReview = async (req, res) => {
    try {
        const { orderId, rating, comment } = req.body;
        const updatedReview = await Review.findOneAndUpdate(
            { orderId },
            { rating, comment },
            { new: true }
        );
        //console.log(updatedReview)
        if (!updatedReview) {
            return res.status(404).json({ success: false, error: "Review not found" });
        }
        return res.status(200).json({ success: true, data: updatedReview });
    } catch (err) {
        console.error("Error editing review:", err);
        return res.status(500).json({ success: false, error: err.message });
    }
};
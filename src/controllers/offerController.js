const Offer = require('../models/Offer');

exports.getAllOffers = async (req, res) => {
  try {
    const offers = await Offer.find();
    return res.status(200).json(offers);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

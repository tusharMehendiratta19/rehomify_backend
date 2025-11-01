const Offer = require("../models/Offer");
const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const s3 = new S3Client({ region: process.env.AWS_REGION });

exports.getAllOffers = async (req, res) => {
  try {
    const offers = await Offer.find().select(
      "type description code image amount percentage isActive"
    );

    const formattedOffers = await Promise.all(
      offers.map(async (offer) => {
        let imageUrl = offer.image;


        try {
          imageUrl = await getSignedUrl(
            s3,
            new GetObjectCommand({
              Bucket: process.env.AWS_BUCKET_NAME,
              Key: offer.image,
            }),
            { expiresIn: 3600 } // 1 hour
          );
        } catch (err) {
          console.error(`Failed to generate signed URL for ${offer.image}:`, err.message);
        }


        return {
          id: offer._id,
          type: offer.type,
          description: offer.description,
          code: offer.code,
          image: imageUrl || null,
          amount: offer.amount || null,
          percentage: offer.percentage || null,
          isActive: offer.isActive,
        };
      })
    );

    return res.status(200).json({
      success: true,
      count: formattedOffers.length,
      data: formattedOffers,
    });
  } catch (err) {
    console.error("Error fetching offers:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

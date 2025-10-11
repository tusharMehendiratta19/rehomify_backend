const mongoose = require("mongoose");

// --- Nested Schemas ---

const CardSchema = new mongoose.Schema({
    card_holder_name: { type: String },
    last_four_digits: { type: String },
    expiry_month: { type: String },
    expiry_year: { type: String },
    brand: { type: String },
    funding: { type: String },
});

const PaymentMethodSchema = new mongoose.Schema({
    type: { type: String },
    card: CardSchema,
});

const MetaDataSchema = new mongoose.Schema({
    key: { type: String },
    value: { type: String },
});

// --- Main Combined Schema ---

const PaymentSchema = new mongoose.Schema({
    customerId: { type: String, required: true },
    productId: { type: String, required: true },
    sellerId: { type: String, required: true },
    orderId: { type: String, required: true },
    // Common Identifiers
    payment_id: { type: String, required: true, unique: true },
    payments_session_id: { type: String },

    // Contact Info
    phone: { type: String },
    receipt_email: { type: String },

    // Amount & Currency Info
    amount: { type: String },
    amount_captured: { type: String },
    amount_refunded: { type: String },
    fee_amount: { type: String },
    net_tax_amount: { type: String },
    total_fee_amount: { type: String },
    net_amount: { type: String },
    currency: { type: String, default: "INR" },

    // Transaction Details
    reference_number: { type: String },
    transaction_reference_number: { type: String },
    invoice_number: { type: String },
    statement_descriptor: { type: String },
    description: { type: String },
    status: {
        type: String,
        enum: ["captured", "partially_refunded", "refunded", "failed", "active"],
    },
    date: { type: Number }, // UNIX timestamp

    // Nested Fields
    payment_method: PaymentMethodSchema,
    meta_data: [MetaDataSchema],

    // --- Payment Link Details ---
    payment_link: {
        payment_link_id: { type: String },
        url: { type: String },
        expires_at: { type: String },
        amount: { type: String },
        amount_paid: { type: String },
        currency: { type: String },
        status: {
            type: String,
            enum: ["active", "expired", "completed", "cancelled"],
        },
        email: { type: String },
        reference_id: { type: String },
        description: { type: String },
        return_url: { type: String },
        phone: { type: String },
        created_time: { type: Number },
        created_by_id: { type: String },
        created_by: { type: String },
        last_modified_by_id: { type: String },
        last_modified: { type: String },
    },
}, { timestamps: true });

// Export single model
module.exports = mongoose.model("Payment", PaymentSchema);

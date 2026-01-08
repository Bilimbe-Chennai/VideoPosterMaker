const mongoose = require("mongoose");

// Stores Premium Admin UI settings (Settings page)
const PremiumAdminSettingsSchema = new mongoose.Schema(
  {
    adminid: { type: String, required: true, unique: true, index: true },
    settings: { type: mongoose.Schema.Types.Mixed, default: {} },
    updatedBy: { type: String, default: "" },
  },
  {
    timestamps: true, // adds createdAt/updatedAt
    minimize: false,
  }
);

module.exports = mongoose.model("PremiumAdminSettings", PremiumAdminSettingsSchema);


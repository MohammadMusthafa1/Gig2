const mongoose = require("mongoose");

const FormSchema = new mongoose.Schema({
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  formName: { type: String, required: true },
  fields: [
    {
      fieldName: { type: String, required: true },
      fieldType: { type: String, required: true },
    },
  ],
  submissions: [
    {
      submittedAt: { type: Date, default: Date.now },
      data: { type: Object, required: true },
    },
  ],
});

module.exports = mongoose.model("Form", FormSchema);

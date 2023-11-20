const { Schema, model } = require("mongoose");

const CommentSchema = Schema(
  {
    content: String,
    user: { type: Schema.Types.ObjectId, ref: "users" },
  },
  {
    timestamps: true,
  }
);

const PostSchema = Schema(
  {
    title: String,
    content: String,
    user: { type: Schema.Types.ObjectId, ref: "users" },
    comments: [CommentSchema],
  },
  {
    timestamps: true,
  }
);

module.exports = model("posts", PostSchema);

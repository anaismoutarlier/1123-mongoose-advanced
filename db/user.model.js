const mongoose = require("mongoose");
const moment = require("moment");

const EMAIL_REGEX =
  /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const UserSchema = mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
      select: false,
      trim: true,
      validate: {
        validator: val => EMAIL_REGEX.test(val),
        message: ({ value }) => `${value} is not a valid email address.`,
      },
    },
    password: {
      type: String,
      required: function () {
        return this.status !== "pending";
      },
      select: false,
    },
    dateCreated: Date,
    type: {
      type: String,
      enum: ["user", "moderator", "admin"],
      default: "user",
    },
    gender: {
      type: String,
      enum: ["male", "female", "non-binary"],
    },
    status: {
      type: String,
      enum: ["pending", "active", "inactive"],
    },
    birthdate: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

UserSchema.pre("deleteOne", async function (next) {
  const filter = this.getFilter();
  await mongoose.model("posts").deleteMany({ user: filter._id });
  await mongoose
    .model("posts")
    .updateMany(
      { "comments.user": filter._id },
      { $pull: { comments: { user: filter._id } } }
    );
  next();
});

UserSchema.post("save", async function (doc) {
  await mongoose.model("posts").create({
    title: `${doc.username}, welcome to Posts.io !`,
    content:
      "This is your first post! Click on the plus to add your own content.",
    user: doc._id,
  });
});

UserSchema.virtual("age").get(function () {
  // this.birthdate
  return moment().diff(this.birthdate, "years");
});

UserSchema.loadClass(
  class {
    static findActive(filter) {
      return this.find({ status: "active", ...filter });
    }

    static findOneActive(filter) {
      return this.findOne({ status: "active", ...filter });
    }

    static findByIdActive(_id) {
      return this.find({ status: "active", _id });
    }

    static findOnePrivate(filter, fields = ["password"]) {
      const select = fields.map(field => `+${field}`).join(" ");
      return this.findOne(filter).select(select);
    }

    static getUserInscriptionStats() {
      const query = [
        {
          $addFields: {
            year: {
              $year: "$dateCreated",
            },
            month: {
              $month: "$dateCreated",
            },
          },
        },
        {
          $group: {
            _id: {
              year: "$year",
              month: "$month",
            },
            users: {
              $push: {
                _id: "$_id",
                username: "$username",
              },
            },
          },
        },
        {
          $sort: {
            "_id.year": 1,
            "_id.month": 1,
          },
        },
        {
          $project: {
            year: "$_id.year",
            month: "$_id.month",
            _id: 0,
            nbUsers: {
              $size: "$users",
            },
          },
        },
        {
          $sort: {
            nbUsers: -1,
          },
        },
      ];
      return this.aggregate(query);
    }
  }
);

module.exports = mongoose.model("users", UserSchema);

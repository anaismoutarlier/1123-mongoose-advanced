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
    },
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
      select: false,
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
  }
);

module.exports = mongoose.model("users", UserSchema);

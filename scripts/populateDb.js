const mongoose = require("mongoose");
const { User, Post } = require("../db");
const fs = require("fs").promises;

const populateDb = async () => {
  const dir = await fs.readdir(".");
  if (!dir.includes("data")) {
    console.log("Data folder missing.");
    return;
  }
  const { users, posts } = require("../data");
  if (!dir.includes("package.json")) {
    console.log("Please run this script from the project root folder.");
    return;
  }
  if (!dir.includes(".env")) {
    await fs.writeFile(".env", 'MONGODB_URI=""');
    console.log(
      "Please include DB environment variables before setup. A .env file with the correct properties has been created for you."
    );
    return;
  }
  require("dotenv").config();
  await mongoose.connect(process.env.MONGODB_URI);
  await User.deleteMany();
  await Post.deleteMany();
  console.log("Database connected.");

  const createdUsers = await User.create(users);
  console.log("User docs created");
  const userIds = createdUsers.map(({ _id }) => _id);
  const postsToCreate = posts.map(post => {
    const i = Math.floor(Math.random() * (userIds.length + 1));
    post.user = userIds[i];
    post.comments = post.comments.map(comment => {
      let j = Math.floor(Math.random() * (userIds.length + 1));
      if (j === i) j === userIds.length - 1 ? j-- : j++;
      comment.user = userIds[j];
      return comment;
    });
    return post;
  });
  await Post.create(postsToCreate);
  console.log("Post docs created");
  await mongoose.disconnect();
  console.log("Database disconnected.");
};

populateDb();

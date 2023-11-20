const { Router } = require("express");
const { User } = require("../db");

const router = Router();

router.post("/", async (req, res) => {
  try {
    await User.create(req.body);

    res.json({ result: true });
  } catch (error) {
    res.json({ result: false, error: error.message });
  }
});

router.delete("/:userId", async (req, res) => {
  const { userId } = req.params;
  await User.deleteOne({ _id: userId });

  res.json({ result: true });
});

router.get("/", async (_, res) => {
  const users = await User.findActive();
  console.log(JSON.stringify({ ...users[0] }, null, 2));

  res.json({ result: true, nbUsers: users.length, users });
});

router.get("/stats/inscriptions", async (_, res) => {
  const data = await User.getUserInscriptionStats();

  res.json({ result: true, data });
});

module.exports = router;

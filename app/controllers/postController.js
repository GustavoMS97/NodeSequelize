const express = require('express');

const { Post, User } = require('../models/');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.post('/', authMiddleware, async (req, res) => {
  try {
    const post = await Post.create({ ...req.body, user_id: req.userId });
    if (post && post.dataValues) {
      let returnValue = post.dataValues;
      const user = await User.findOne({ where: { id: req.userId } });
      if (user && user.dataValues) {
        delete post.dataValues.user_id;
        returnValue = { ...post.dataValues, owner: user.dataValues };
      }
      return res.status(201).send(returnValue);
    }
    return res.status(400).send({ message: 'Error creating a Post' });
  } catch (error) {
    return res.status(400).send(error);
  }
});

module.exports = app => app.use('/post', router);

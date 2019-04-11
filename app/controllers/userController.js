const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const { User, Post } = require('../models/');
const authMiddleware = require('../middleware/auth');
const authConfig = require('../../config/auth.json');

const router = express.Router();

function generateToken(params = {}) {
  return jwt.sign(params, authConfig.secret, {
    expiresIn: 60 * 60 * 10, // 10 HORAS
  });
}

// Criar
router.post('/', async (req, res) => {
  try {
    const checkedUser = await User.findAll({
      where: { email: req.body.email, password: req.body.password },
    });

    if (checkedUser && checkedUser.length > 0) {
      return res.status(406).send({ message: 'User already exists' });
    }

    const user = await User.create(req.body);
    if (user.dataValues.password) {
      delete user.dataValues.password;
      return res.status(201).send(user);
    }
    return res.status(400).send({ message: 'Malformatted request' });
  } catch (error) {
    return res.status(400).send(error);
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const hash = crypto
    .createHash('RSA-SHA256')
    .update(password)
    .update(authConfig.salt)
    .digest('hex');

  const userArray = await User.findAll({
    where: {
      email,
      password: hash,
    },
  });
  if (userArray && userArray.length > 0 && userArray.length === 1) {
    const token = generateToken({
      id: userArray[0].dataValues.id,
      email: userArray[0].dataValues.email,
    });
    return res.status(200).send({ token, type: 'Bearer' });
  }
  return res.status(406).send({ message: 'Error login in, user not found!' });
});

// Listar todos
router.get('/', authMiddleware, async (req, res) => {
  const userList = await User.findAll({});
  userList.forEach((user) => {
    delete user.dataValues.password;
  });

  return res.status(200).send(userList);
});

// Buscar
router.get('/:id(\\d+)/', authMiddleware, async (req, res) => {
  try {
    if (!req.params.id) {
      return res.status(400).send({ message: 'Id was not provided in the URL' });
    }
    const user = await User.findOne({
      where: {
        id: req.params.id,
      },
    });
    if (user && user.dataValues) {
      const posts = await Post.findAll({ where: { user_id: req.userId } });
      delete user.dataValues.password;
      let returnValue = user.dataValues;
      if (posts && posts.length > 0) {
        const postArray = posts.map(post => post.dataValues);
        returnValue = { ...returnValue, posts: postArray };
      }
      return res.status(200).send(returnValue);
    }
    return res.status(400).send({ message: 'User does not exists' });
  } catch (error) {
    return res.status(400).send({ message: 'Error finding user.' });
  }
});

//Buscar a si mesmo.
router.get('/me', authMiddleware, async (req, res) => {
  try{
    const user = await User.findOne({
      where: {
        id: req.userId,
      },
    });
    if(user && user.dataValues) {
      const posts = await Post.findAll({ where: { user_id: req.userId } });
      delete user.dataValues.password;
      let returnValue = user.dataValues;
      if (posts && posts.length > 0) {
        const postArray = posts.map(post => post.dataValues);
        returnValue = { ...returnValue, posts: postArray };
      }
      return res.status(200).send(returnValue);
    }
  }catch(error) {
    return res.status(406).send({message: 'Error fetching user'});
  }
});

// Editar
router.put('/:id', authMiddleware, async (req, res) => {
  if (!req.params.id) {
    return res.status(400).send({ message: 'Id was not provided in the URL' });
  }

  const updateValues = {};
  if (req.body.email) {
    updateValues.email = req.body.email;
  }
  if (req.body.name) {
    updateValues.name = req.body.name;
  }
  const response = await User.update(updateValues, { where: { id: req.params.id } });
  const message = response[0] === 1 ? 'User was updates successfully' : 'User does not exists';
  return res.status(200).send({ message });
});

// Deletar
router.delete('/:id', authMiddleware, async (req, res) => {
  if (!req.params.id) {
    return res.status(400).send({ message: 'Id was not provided in the URL' });
  }

  const response = await User.destroy({
    where: {
      id: parseInt(req.params.id, 10),
    },
  });
  const message = response > 0 ? 'Successfully deleted!' : 'Data not found';
  return res.status(200).send({ message });
});

module.exports = app => app.use('/user', router);

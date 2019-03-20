const express = require('express');
const { User } = require('../models/');

const router = express.Router();

// Listar todos
router.get('/', async (req, res) => {
  const userList = await User.findAll({});
  userList.forEach((user) => {
    console.log(user);
    delete user.dataValues.password;
  });

  return res.status(200).send(userList);
});

// Criar
router.post('/', async (req, res) => {
  const user = await User.create(req.body);
  delete user.password;
  return res.status(201).send(user);
});

// Buscar
router.get('/:id', async (req, res) => {
  if (!req.params.id) {
    return res.status(400).send({ message: 'Id was not provided in the URL' });
  }

  const user = await User.findAll({
    where: {
      id: req.params.id,
    },
  });

  delete user.password;

  return res.status(200).send(user);
});

// Editar
router.put('/:id', async (req, res) => {
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
router.delete('/:id', async (req, res) => {
  if (!req.params.id) {
    return res.status(400).send({ message: 'Id was not provided in the URL' });
  }

  const response = await User.destroy({
    where: {
      id: req.params.id,
    },
  });
  const message = response > 0 ? 'Successfully deleted!' : 'Data not found';
  return res.status(200).send({ message });
});

module.exports = app => app.use('/user', router);

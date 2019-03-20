const express = require('express');
const { User } = require('../models/');

const router = express.Router();

router.get('/users', (req, res) => {}); // Listar todos
router.post('/users', (req, res) => {}); // Criar
router.get('/users/:id', (req, res) => {}); // Buscar
router.put('/users/:id', (req, res) => {}); // Editar
router.delete('/users/:id', (req, res) => {}); // Deletar

// Registrar
router.post('/register', async (req, res) => {
  console.log(req.body);
  const user = await User.create(req.body);
  res.status(201).send(user);
});

module.exports = app => app.use('/user', router);

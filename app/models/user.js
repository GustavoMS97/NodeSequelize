const crypto = require('crypto');
const authConfig = require('../../config/auth.json');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    'User',
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: { msg: 'Empty name is not allowed.' },
          len: {
            args: [1, 20],
            msg: 'Name should be between 1 and 20 characters.',
          },
        },
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: { msg: 'Empty email is not allowed.' },
          isEmail: {
            msg: 'This field should be a valid email.',
          },
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: { msg: 'Password must not be empty.' },
        },
      },
    },
    {
      hooks: {
        beforeCreate: async (user) => {
          const encrypted = crypto
            .createHash('RSA-SHA256')
            .update(user.password)
            .update(authConfig.salt)
            .digest('hex');
          user.password = encrypted;
        },
      },
    },
  );
  return User;
};

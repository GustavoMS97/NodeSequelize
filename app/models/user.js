const crypto = require('crypto');
const authConfig = require('../../config/auth.json');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    'User',
    {
      name: DataTypes.STRING,
      email: DataTypes.STRING,
      password: DataTypes.STRING,
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

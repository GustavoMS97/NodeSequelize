module.exports = (sequelize, DataTypes) => {
  const Post = sequelize.define('Post', {
    title: DataTypes.STRING,
    post: DataTypes.STRING,
    user_id: DataTypes.INTEGER,
  });
  return Post;
};

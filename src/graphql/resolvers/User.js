module.exports = {
  username: (parent) => {
    return `${parent.firstName}_${parent.lastName}_${parent.id}`;
  },
};

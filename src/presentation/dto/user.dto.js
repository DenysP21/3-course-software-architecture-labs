function toUserDTO(user) {
  return {
    id: user.id,
    email: user.email,
  };
}

module.exports = { toUserDTO };

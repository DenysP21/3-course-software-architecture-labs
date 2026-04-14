async function getProfile(userId, userRepository) {
  if (!userId) {
    throw new Error("User id is required");
  }

  return await userRepository.findById(userId);
}

module.exports = { getProfile };
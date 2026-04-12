export const up = async (db) => {
  const users = db.collection("users");

  // Backfill missing array fields so older documents match current User model expectations.
  await users.updateMany(
    { friends: { $exists: false } },
    { $set: { friends: [] } }
  );

  await users.updateMany(
    { incomingFriendRequests: { $exists: false } },
    { $set: { incomingFriendRequests: [] } }
  );

  await users.updateMany(
    { outgoingFriendRequests: { $exists: false } },
    { $set: { outgoingFriendRequests: [] } }
  );

  await users.updateMany(
    { profilePic: { $exists: false } },
    { $set: { profilePic: "" } }
  );
};

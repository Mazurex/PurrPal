module.exports = (tier = 1) => {
  let returnTier = 0;

  if (tier === 1) {
    returnTier = 500;
  } else if (tier === 2) {
    returnTier = 5000;
  } else if (tier === 3) {
    returnTier = 10000;
  } else if (tier === 4) {
    returnTier = 15000;
  } else {
    returnTier = null;
  }

  return returnTier;
};

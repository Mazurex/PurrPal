module.exports = (tier = 1) => {
  let returnTier = 0;

  if (tier === 1) {
    returnTier = 2000;
  } else if (tier === 2) {
    returnTier = 8000;
  } else if (tier === 3) {
    returnTier = 15000;
  } else if (tier === 4) {
    returnTier = 20000;
  } else {
    returnTier = null;
  }

  return returnTier;
};

const getOrdinalNum = (number) => {
  switch (true) {
    case number === 1:
      return "first";
    case number === 2:
      return "second";
    case number === 3:
      return "third";
    case number >= 4:
      return `${number}th`;
    default:
      return null;
  }
};

const getShareText = (playerPlace) => {
  if (!playerPlace) return "Check out the Basemass game!";

  return `I scored ${getOrdinalNum(
    playerPlace
  )} place in the Basemass game! Check it out!`;
};

export default getShareText;

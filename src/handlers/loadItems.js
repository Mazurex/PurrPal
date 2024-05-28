const fs = require("fs");
const path = require("path");

const loadItems = () => {
  const itemsPath = path.join(__dirname, "../items/items.json");
  const specialItemsPath = path.join(__dirname, "../items/special.json");

  const itemsData = JSON.parse(fs.readFileSync(itemsPath, "utf8"));
  const specialItemsData = JSON.parse(
    fs.readFileSync(specialItemsPath, "utf8")
  );

  return {
    ...itemsData,
    ...specialItemsData,
  };
};

module.exports = loadItems;

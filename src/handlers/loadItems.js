const fs = require("fs");
const path = require("path");

const loadItems = () => {
  const filePath = path.join(__dirname, "..", "items", "items.json");
  const fileContent = fs.readFileSync(filePath, "utf8");
  return JSON.parse(fileContent);
};

module.exports = loadItems;

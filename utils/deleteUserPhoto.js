const { unlink } = require("node:fs/promises");

const deleteUserImage = async path => {
  try {
    await unlink(path);
    console.log(`successfully deleted ${path}`);
  } catch (err) {
    console.log(err);
    console.log("An error occurred while deleting the file");
  }
};

module.exports = deleteUserImage;

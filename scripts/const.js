const path = require(`path`);

// We are in the 'scripts' folder, so use the parent dir
const parentDir = path.join(__dirname, `../`);

const TEMP_DIR = `tmp`;
const TEMPLATE_DIR = `templates`;
const FILES_DIR = `files`;

module.exports = {
  TEMPLATE_DIR_PATH: path.join(parentDir, TEMPLATE_DIR),
  FILES_DIR_PATH: path.join(parentDir, FILES_DIR),
  TEMPLATE_DIR_TEMP_PATH: path.join(parentDir, TEMP_DIR),
  OUT_DIR_PATH: process.cwd(),
};

import DataUriParser from "datauri/parser.js";
import path from "path";

const parser = new DataUriParser();

const getDataUri = (file) => {
  const extension = path.extname(file.originalname);

  return parser.format(extension, file.buffer).content;
};

export default getDataUri;

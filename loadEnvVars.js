const fs = require("fs");
const path = require("path");
const yargs = require("yargs");
const { writeFile } = require("fs");
require("dotenv").config();

const argv = yargs
  .option("env", {
    alias: "e",
    description: "Environment type",
    type: "string",
  })
  .help()
  .alias("help", "h").argv;

const dirPath = path.join(__dirname, "src/environments");
if (!fs.existsSync(dirPath)) {
  fs.mkdirSync(dirPath, { recursive: true });
}

const environment = argv.env;

const defaultPath = `./src/environments/environment.ts`;
const targetPath = `./src/environments/environment.${environment}.ts`;

// Load environment variables from .env file
const envConfigFile = `
export const environment = {
  firebaseConfig: {
    production: ${environment === "prod"},
    apiKey: '${process.env["FIRE_API_KEY"]}',
    authDomain: '${process.env["FIRE_AUTH_DOMAIN"]}',
    projectId: '${process.env["FIRE_PROJECT_ID"]}',
    storageBucket: '${process.env["FIRE_STORAGE_BUCKET"]}',
    messagingSenderId: '${process.env["FIRE_MESSAGING_SENDER_ID"]}',
    appId: '${process.env["FIRE_APP_ID"]}'
  }
};
`;

// Write the environment config file
writeFile(defaultPath, envConfigFile, (err) => {
  if (err) {
    console.log(err);
  }
});
writeFile(targetPath, envConfigFile, (err) => {
  if (err) {
    console.log(err);
  }
});

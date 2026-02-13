import dotenv from "dotenv";
dotenv.config();

export const env = {
  BOT_TOKEN: process.env.DISCORD_BOT_TOKEN || "",
  YT_COOKIES_PATH: process.env.YT_COOKIES_PATH || "",
  ERROR_COMMITS_FILE: process.env.ERROR_COMMITS_FILE || "",
  SYSTEM_ERRORS_FILE: process.env.SYSTEM_ERRORS_FILE || "",
  MONGO_DB_URI: process.env.MONGO_DB_URI || "",
  SC_CLIENT_ID: process.env.SOUNDCLOUD_CLIENT_ID || ""
};



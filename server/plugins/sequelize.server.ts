import { Sequelize } from "sequelize";
import { initModels } from "../models";
import { NitroApp } from "nitropack";
import { config } from 'dotenv'
config();

export const sequelize = new Sequelize({
  dialect: "postgres",
  host: process.env.DB_HOST,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT ?? "5432"),
  pool: { max: 20, min: 0, idle: 10000 },
});

initModels(sequelize);

export default defineNitroPlugin((nitroApp: NitroApp) => {
  nitroApp.hooks.hook("request", (event) => {
    event.context.sequelize = sequelize;
  });
});

import { DataSource } from "typeorm";
import { DataSourceOptions } from "typeorm/data-source/DataSourceOptions";

let connectionOptions: DataSourceOptions = {
  type: "mysql" as "mysql",
  host: "localhost",
  port: 3306,
  username: "root",
  password: "Secure@156",
  database: "grocery",
  synchronize: false,
  logging: true,
  entities: ["src/entities/*.ts"],
  migrations: ["src/migrations/*.ts"], 
};
const dataSource = new DataSource(connectionOptions);
export default dataSource;

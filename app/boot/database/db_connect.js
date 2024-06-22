const pg = require("pg");

let db_connection;

function startConnection() {
  // type parsers here
  pg.types.setTypeParser(1082, function (stringValue) {
    return stringValue;
  });

  db_connection = new pg.Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST || "127.0.0.1",
    database: process.env.DB_NAME || "postgres",
    password: process.env.DB_PASSWORD,
    port: 5432,
    max: 10,
  });

  db_connection.connect((err, client) => {
    if (!err) {
      console.log("PostgreSQL connected");
    } else {
      console.error("PostgreSQL connection failed");
      startConnection();
    }
  });

  db_connection.on("error", (err, client) => {
    console.error("Unexpected error on idle client", err);
    startConnection();
  });
}

startConnection();

module.exports = db_connection;

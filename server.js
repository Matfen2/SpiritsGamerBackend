require('dotenv').config();
const express = require("express");
const cors = require("cors");
const mysql = require("mysql");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json()); 

const db = mysql.createPool({
  port: process.env.DB_PORT,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  connectionLimit: 100,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

db.getConnection((error, connection) => {
  if (error) {
    console.error("Failed to connect to database:", error);
  }
  console.log("Connection to database successful");
  connection.release(); 
});

app.get("/", (req, res) => {
  res.send("Hello Everyone");
});

app.listen(PORT, () => {
  console.log("Server is running on port " + PORT);
});

// SEARCH
app.get("/games/:title", (req, res) => {
  const title = req.params.title;

  let qr = `SELECT * FROM games WHERE title LIKE ?`;

  db.query(qr, [`%${title}%`], (error, result) => {
    if (error) {
      console.log(error);
      res.status(500).send({ message: "Internal server error" });
    }
    if (result.length > 0) {
      res.send({
        message: "get titles success",
        data: result,
      });
    } else {
      res.send({
        message: "get titles error",
      });
    }
  });
});
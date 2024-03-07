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

// LOGIN
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  const query = `SELECT * FROM user WHERE email = ? AND password = ?`;

  db.query(query, [email, password], (error, results) => {
    if (error) {
      console.error("Error in login query:", error);
      return res.status(500).send({ message: "Internal server error" });
    }

    if (results.length > 0) {
      return res.status(200).send({ message: "Login successful" });
    } else {
      return res.status(400).send({ message: "Incorrect email or password." });
    }
  });
});

// REGISTER
app.post("/signup", (req, res) => {
  const { pseudo, email, phone, password } = req.body;

  const query = `SELECT pseudo, email, phone, password FROM user WHERE email = ?`;

  db.query(query, [email], (error, results) => {
    if (error) {
      console.error("Error in signup query:", error);
      return res.status(500).send({ message: "Database error" });
    }

    if (results.length > 0) {
      return res.status(400).send({ message: "Account already exists." });
    } else {
      const insertQuery = `INSERT INTO user (pseudo, email, phone, password) VALUES (?, ?, ?, ?)`;

      db.query(insertQuery, [pseudo, email, phone, password], (error, results) => {
        if (error) {
          console.error("Error inserting data:", error); 
          return res.status(500).send({ message: "Registration failed" });
        } else {
          return res.status(200).send({ message: "Registration successful" });
        }
      });
    }
  });
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
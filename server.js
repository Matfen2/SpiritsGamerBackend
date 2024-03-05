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
  let adress = req.body.adress;
  let pass = req.body.pass;

  let qr = `SELECT * FROM user WHERE adress = ? AND pass = ?`;

  db.query(qr, [adress, pass], (error, results) => {
    if (!error) {
      if (results.length > 0) {
        return res.status(200).send({ message: "Login successful" });
      } else {
        return res
          .status(400)
          .send({ message: "Incorrect email or password." });
      }
    } else {
      return res.status(500).send({ message: "Internal server error" });
    }
  });
});

// REGISTER
app.post("/signup", (req, res) => {
  let connect = req.body;
  let query = `SELECT pseudo, adress, phone, pass FROM user WHERE adress = ?`;

  db.query(query, [connect.adress], (error, results) => {
    if (!error) {
      if (results.length <= 0) {
        let qr = `INSERT INTO user (pseudo, adress, phone, pass) VALUES (?, ?, ?, ?)`;
        console.log("Data to be inserted:", connect.pseudo, connect.adress, connect.phone, connect.pass);
        db.query(
          qr,
          [connect.pseudo, connect.adress, connect.phone, connect.pass],
          (error, results) => {
            if (!error) {
              return res
                .status(200)
                .send({ message: "Registration successful" });
            } else {
              console.error("Error inserting data:", error); 
              return res.status(500).send({ message: "Registration failed" });
            }
          }
        );
      } else {
        return res.status(400).json({ message: "Account already exists." });
      }
    } else {
      return res.status(500).json({ message: "Database error" });
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
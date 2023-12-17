// Importing required modules

const express = require("express");
const path = require("path");
const fs = require("fs");
const uuid = require('./helpers/uuid');

const app = express();
const PORT = process.env.PORT || 3001;
const destination = "./db/db.json";
// Declaring middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extend: true }));
// Middleware to serve static files from the "public" directory
app.use(express.static("public"));
// Route to serve the homepage, notes page, and get notes from the server
app.get("/", (req, res) =>
  res.sendFile(path.join(__dirname, "/public/index.html"))
);

app.get("/notes", (req, res) =>
  res.sendFile(path.join(__dirname, "/public/notes.html"))
);
// Route to get notes from the server
app.get("/api/notes", (req, res) => {
  console.info(`${req.method} request received to get notes`);
  // Reading db.json file
  fs.readFile(destination, (err, data) => {
    if (err) {
      console.error(err);
    } else {
      res.json(JSON.parse(data));
    }
  });
});
// Route to add a new note to the server
app.post("/api/notes", (req, res) => {
  console.info(`${req.method} request received`);
  let newNotes;
  // Extracting title and text from the request body
  const { title, text } = req.body;

  if (text && title) {
    // Creating a new note object with a unique id
    newNotes = {
      title,
      text,
      id: uuid(),
    };
    // Reading existing notes from the db.json file
    fs.readFile(destination, (err, data) => {
      if (err) {
        console.error(err);
      } else {
        let notes = JSON.parse(data);
        // updating array data in db file
        notes.push(newNotes);
        //writing updated array to the db.json file
        fs.writeFile("./db/db.json", JSON.stringify(notes), (error) =>
          error ? console.error(error) : console.info("\n Data written to file")
        );
      }
    });
    // Sending a success response with the new note
    const response = {
      status: "success",
      body: newNotes,
    };

    console.log(response);
    res.status(201).json(response);
  } else {
    // Sending an error response if title or text is missing
    res.status(500).json("Error in posting notes");
  }
});
// Route to delete a note from the server
app.delete("/api/notes/:id", (req, res) => {
  console.info(`${req.method} request received to delete a note`);

  // extracting node id from the URL parameters
  const targetId = req.params.id;
  // if the id exist, read file to extract data db.json file
  if (targetId) {
    fs.readFile(destination, (err, data) => {
      if (err) {
        console.error(err);
      } else {
        let myArray = JSON.parse(data);
        //filter out the object that has the id that needs to be deleted
        myArray = myArray.filter((obj) => obj.id !== targetId);

        //after filtering the id, write new array to db.json file
        fs.writeFile(destination, JSON.stringify(myArray, null, 4), (err) => {
          if (err) {
            console.error(err);
            res.status(500).json("Error writing file");
          } else {
            console.info(`\nData written to ${destination}`);
            const response = {
              status: "success",
            };
            console.log(response);
            res.status(204).json(response);
          }
        });
      }
    });
  } else {
    // Sending an error response if the id is missing
    res.status(500).json("Error in deleting note");
  }
});
// Start the server and listen on the specified port
app.listen(PORT, () => console.log(`Listening on port ${PORT}!`));

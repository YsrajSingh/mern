const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const app = express();

// Import the database connection
const db = require("./connection");

// Import the routes module
const routes = require("./routes");
const cors = require("cors");
// Set EJS as the view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Parses the text as url encoded data
app.use(bodyParser.urlencoded({ extended: true }));

// Parses the text as json
app.use(bodyParser.json());
app.use(express.json());
app.use(cors());
// Use the routes module to handle routes
app.use("/", routes);
const port = process.env.PORT || 3000;

// Start the server only when the MongoDB connection is established
db.once("open", () => {
    app.listen(port, () => {
        console.log(`Server is running on : http://localhost:${port}`);
    });
});

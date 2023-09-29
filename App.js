const express = require("express");
const path = require("path");
const routes = require("./routes"); // Import the routes module

const app = express();

// Set EJS as the view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Use the routes module to handle routes
app.use("/", routes);

const port = 3000;
app.listen(port, () => {
    console.log(`Server is running on : http://localhost:${port}`);
});

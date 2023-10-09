const mongoose = require("mongoose");
const uri =
    "mongodb+srv://admin:123@mern.e3agjmx.mongodb.net/?retryWrites=true&w=majority";

mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "Database connection error:"));
db.once("open", () => {
    console.log("Database Connected Successfully.");
});

module.exports = db;

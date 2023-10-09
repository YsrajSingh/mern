const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    first_name: String,
    last_name: String,
    license_no: String,
    age: Number,
    car_details: {
        make: String,
        model: String,
        year: Number,
        plat_no: String,
    },
});

module.exports = mongoose.model("User", userSchema);

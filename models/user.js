const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    first_name: String,
    last_name: String,
    license_no: String,
    age: Number,
    username: {
        type: String,
        unique: true, // Ensure uniqueness of the username
    },
    password: String,
    user_type: String,
    test_type: {
        type: String,
        enum: ["G", "G2"], // Only allow "G" and "G2" as valid values
    },
    comments: String,
    isPass: Boolean,
    car_details: {
        make: String,
        model: String,
        year: Number,
        plat_no: String,
    },
    // Add a foreign key reference to the Appointment model
    appointments: [
        { type: mongoose.Schema.Types.ObjectId, ref: "Appointment" },
    ],
});

module.exports = mongoose.model("User", userSchema);

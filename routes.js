const express = require("express");
const User = require("./models/user");
const Appointment = require("./models/appointment");
const router = express.Router();
const bcrypt = require("bcrypt");
var CryptoJS = require("crypto-js");
var {
    requireLogin,
    checkUserLoggedIn,
    saveUserDataToCookies,
    clearUserDataFromCookies,
    isDriver,
    isAdmin,
    isExaminer,
} = require("./views/script/auth");
const saltRounds = 10;

router.get("/", (req, res) => {
    res.render("dashboard");
});

router.get("/g", isDriver, (req, res) => {
    res.render("g");
});

router.get("/g2", isDriver, (req, res) => {
    res.render("g2");
});

router.get("/appointment", isAdmin, (req, res) => {
    res.render("appointments");
});

router.get("/results", isAdmin, (req, res) => {
    res.render("results");
});

router.get("/examiner", isExaminer, (req, res) => {
    res.render("examiner");
});

router.get("/dashboard", (req, res) => {
    res.render("dashboard");
});

router.get("/login", (req, res) => {
    res.render("login");
});

router.get("/logout", (req, res) => {
    res.render("logout");
});

// ======================================
// API start Here
// ======================================

// Sign up

router.post("/api/registration", async (req, res) => {
    const { username, password, confirm_password, user_type } = req.body;
    if (password !== confirm_password) {
        res.status(400).json({
            error: "Password and Confirm Password does not match.",
        });
    } else {
        const user_found = await User.findOne({
            username: username,
        });
        if (user_found) {
            res.status(400).json({ error: "Username already exists" });
        } else {
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            try {
                const user = new User({
                    username: username,
                    password: hashedPassword,
                    user_type: user_type,
                });
                await user.save();
                saveUserDataToCookies(res, user);
                res.status(201).json(user);
            } catch (error) {
                res.status(400).json({ error: "Failed to create user" });
            }
        }
    }
});

router.post("/api/login", async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username: username });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        } else {
            const isPasswordMatch = await bcrypt.compare(
                password,
                user.password
            );
            if (isPasswordMatch) {
                saveUserDataToCookies(res, user);
                res.status(200).json({ message: "Login successful" });
            } else {
                res.status(401).json({ error: "User Authentication failed" });
            }
        }
    } catch (error) {
        res.status(400).json({ error: "Failed to create user" });
    }
});

// To Decrypt
// var bytes  = CryptoJS.AES.decrypt(ciphertext, 'secret key 123');
// var originalText = bytes.toString(CryptoJS.enc.Utf8);

// Create a new user
router.post("/api/users", async (req, res) => {
    const {
        first_name,
        last_name,
        license_no,
        age,
        make,
        model,
        year,
        plat_no,
        date,
        time,
        test_type,
    } = req.body;
    try {
        const auth_user = checkUserLoggedIn(req);
        if (!auth_user) {
            res.status(401).json({ error: "Unauthorized Access" });
        }
        if (license_no.length < 8) {
            res.status(400).json({
                error: "License Number must contains 8 alphanumerics",
            });
        } else {
            // Find the corresponding Appointment based on date and time
            const appointment = await Appointment.findOne({
                date: new Date(date),
                time,
                isTimeSlotAvailable: true,
            });

            if (!appointment) {
                res.status(400).json({
                    error: "No available appointment found for the selected date and time",
                });
                return;
            }
            var encrypted_license_no = CryptoJS.AES.encrypt(
                license_no,
                "g64r~,3Kr!8_SP/-O79CW~l@r9Q?X+]n(@i+!WZgey[HCY(,#"
            ).toString();

            const user = await User.findByIdAndUpdate(
                auth_user?._id,
                {
                    first_name,
                    last_name,
                    license_no: encrypted_license_no,
                    age,
                    test_type,
                    car_details: {
                        make,
                        model,
                        year,
                        plat_no,
                    },
                    comments: null,
                    isPass: null,
                    appointments: [appointment._id], // Assign the Appointment's _id
                },
                {
                    new: true, // Return the updated user
                }
            );

            // Mark the appointment as booked
            appointment.isTimeSlotAvailable = false;
            await appointment.save();

            res.json(user);
        }
    } catch (error) {
        console.log(error);
        res.status(400).json({ error: "Failed to create user" });
    }
});

router.get("/api/filter/user", async (req, res) => {
    try {
        const auth_user = checkUserLoggedIn(req);
        const user = await User.findById(auth_user?._id).populate({
            path: "appointments",
            select: "date time isTimeSlotAvailable",
        });
        if (!user) {
            res.status(401).json({ error: "Unauthorized Access" });
        }
        res.json(user);
    } catch (error) {
        res.status(400).json({ error: "Failed to create user" });
    }
});

// Retrieve all users
router.get("/api/users", async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve users" });
    }
});

// Define API endpoint to retrieve users with appointments
router.get("/api/users-with-appointments", async (req, res) => {
    try {
        // Find users with appointments
        const usersWithAppointments = await User.find({
            appointments: { $exists: true, $not: { $size: 0 } },
        })
            .populate("appointments")
            .exec();
        res.json(usersWithAppointments);
    } catch (error) {
        console.error("Error retrieving users with appointments:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Retrieve a single user by license number
router.get("/api/users/:l_no", async (req, res) => {
    var encrypted_license_no = CryptoJS.AES.encrypt(
        req.params.l_no,
        "g64r~,3Kr!8_SP/-O79CW~l@r9Q?X+]n(@i+!WZgey[HCY(,#"
    ).toString();

    try {
        const user = await User.findOne({ license_no: encrypted_license_no });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve user" });
    }
});

// Update a user by ID
router.put("/api/update/user", async (req, res) => {
    const { make, model, year, plat_no, date, time, test_type } = req.body;
    try {
        const appointment = await Appointment.findOne({
            date: new Date(date),
            time,
            isTimeSlotAvailable: true,
        });

        if (!appointment) {
            res.status(400).json({
                error: "No available appointment found for the selected date and time",
            });
            return;
        }

        const auth_user = checkUserLoggedIn(req);
        if (!auth_user) {
            res.status(401).json({ error: "Unauthorized Access" });
        }
        const user = await User.findByIdAndUpdate(
            auth_user?._id,
            {
                car_details: {
                    make,
                    model,
                    year,
                    plat_no,
                },
                appointments: [appointment._id], // Assign the Appointment's _id
                test_type,
                comments: null,
                isPass: null,
            },
            {
                new: true, // Return the updated user
            }
        );
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        appointment.isTimeSlotAvailable = false;
        await appointment.save();
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: "Failed to update user" });
    }
});

// Delete a user by ID
router.delete("/api/users/:id", async (req, res) => {
    try {
        const user = await User.findByIdAndRemove(req.params.id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: "Failed to delete user" });
    }
});

// Assignment 4
// Appointment for Admin Routes

// Display available time slots for all dates and times
router.get("/api/fetch/appointments", async (req, res) => {
    const auth_user = checkUserLoggedIn(req);
    if (auth_user) {
        try {
            const allAppointments = await Appointment.find({});
            res.json(allAppointments);
        } catch (error) {
            res.status(400).json({ error: "Failed to fetch Appointments" });
        }
    } else {
        res.status(401).json({ error: "Unauthorized Access" });
    }
});

// Allow Admin users to add new time slots
router.post("/api/appointment", async (req, res) => {
    const auth_user = checkUserLoggedIn(req);
    const { date, time } = req.body;
    if (auth_user) {
        try {
            // Check if the time slot already exists for the given date
            const existingSlot = await Appointment.findOne({ date, time });
            if (existingSlot) {
                return res
                    .status(400)
                    .json({ error: "Time slot already exists" });
            }
            // Create a new appointment slot
            const newAppointment = new Appointment({
                date,
                time,
                isTimeSlotAvailable: true,
            });
            await newAppointment.save();

            res.status(201).json(newAppointment);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    } else {
        res.status(401).json({ error: "Unauthorized Access" });
    }
});

// Display available time slots for a specific date
router.get("/api/single/appointments", async (req, res) => {
    const auth_user = checkUserLoggedIn(req);

    if (auth_user) {
        try {
            const { date } = req.query;

            if (!date) {
                return res
                    .status(400)
                    .json({ error: "Date parameter is required" });
            }

            const appointmentsForDate = await Appointment.find({
                date: {
                    $gte: new Date(date), // Greater than or equal to the start of the selected date
                    $lt: new Date(
                        new Date(date).setDate(new Date(date).getDate() + 1)
                    ), // Less than the start of the next day
                },
                isTimeSlotAvailable: true,
            });

            res.json(appointmentsForDate);
        } catch (error) {
            res.status(400).json({ error: "Failed to fetch Appointments" });
        }
    } else {
        res.status(401).json({ error: "Unauthorized Access" });
    }
});

// update user by id
router.post("/api/update/users/:id", async (req, res) => {
    const { comments, pass, fail } = req.body;
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        const auth_user = checkUserLoggedIn(req);
        if (!auth_user) {
            res.status(401).json({ error: "Unauthorized Access" });
        }

        let is_pass = false;
        if (pass) {
            is_pass = true;
        } else if (fail) {
            is_pass = false;
        }

        const response = await user.updateOne(
            {
                comments,
                isPass: is_pass,
            },
            {
                new: true, // Return the updated user
            }
        );

        res.json(user);
    } catch (error) {
        console.log(error);
        res.status(400).json({ error: "Failed to update user data" });
    }
});

module.exports = router;

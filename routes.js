const express = require("express");
const User = require("./models/user");
const router = express.Router();

router.get("/", (req, res) => {
    res.render("dashboard");
});

router.get("/g", (req, res) => {
    res.render("g");
});

router.get("/g2", (req, res) => {
    res.render("g2");
});

router.get("/dashboard", (req, res) => {
    res.render("dashboard");
});

router.get("/login", (req, res) => {
    res.render("login");
});

// ======================================
// API start Here
// ======================================

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
    } = req.body;
    try {
        const user = new User({
            first_name,
            last_name,
            license_no,
            age,
            car_details: {
                make,
                model,
                year,
                plat_no,
            },
        });
        await user.save();
        res.status(201).json(user);
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

// Retrieve a single user by license number
router.get("/api/users/:l_no", async (req, res) => {
    try {
        const user = await User.findOne({ license_no: req.params.l_no });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve user" });
    }
});

// Update a user by ID
router.put("/api/users/:id", async (req, res) => {
    const { make, model, year, plat_no } = req.body;
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            {
                car_details: {
                    make,
                    model,
                    year,
                    plat_no,
                },
            },
            {
                new: true, // Return the updated user
            }
        );
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
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

module.exports = router;

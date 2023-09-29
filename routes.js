const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
    res.end("Welcome to Home Page");
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

module.exports = router;

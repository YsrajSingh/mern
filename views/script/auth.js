const cookie = require("cookie");

// Check if the user is logged in by looking at cookies
function checkUserLoggedIn(req) {
    const cookies = cookie.parse(req.headers.cookie || ""); // Parse cookies from the request
    const userData = cookies["ilu_order_xyz_panel"];

    if (userData) {
        const user = JSON.parse(userData);
        return user;
    }
    return null;
}

// Function to save user data to cookies
function saveUserDataToCookies(res, user) {
    const userData = JSON.stringify(user);
    res.setHeader(
        "Set-Cookie",
        cookie.serialize("ilu_order_xyz_panel", userData, {
            maxAge: 365 * 24 * 60 * 60, // Set the cookie to expire in 1 year
            path: "/", // Specify the path for the cookie
        })
    );
}

function isDriver(req, res, next) {
    const user = checkUserLoggedIn(req);
    if (user && user.user_type === "driver") {
        // If the user is a driver, allow access to the next route handler
        next();
    } else {
        // If the user is not a driver, you can handle this case (e.g., redirect, show an error page)
        res.redirect("/"); // Example: Redirect to the homepage
    }
}

function isAdmin(req, res, next) {
    const user = checkUserLoggedIn(req);
    if (user && user.user_type === "admin") {
        // If the user is a admin, allow access to the next route handler
        next();
    } else {
        // If the user is not a admin, you can handle this case (e.g., redirect, show an error page)
        res.redirect("/"); // Example: Redirect to the homepage
    }
}

function isExaminer(req, res, next) {
    const user = checkUserLoggedIn(req);
    if (user && user.user_type === "examiner") {
        // If the user is a examiner, allow access to the next route handler
        next();
    } else {
        // If the user is not a examiner, you can handle this case (e.g., redirect, show an error page)
        res.redirect("/"); // Example: Redirect to the homepage
    }
}

// Function to clear user data from cookies (logout)
function clearUserDataFromCookies(res) {
    res.setHeader(
        "Set-Cookie",
        cookie.serialize("ilu_order_xyz_panel", "", {
            maxAge: -1, // Expire the cookie to remove it
            path: "/",
        })
    );
}

function requireLogin(req, res, next) {
    const user = checkUserLoggedIn(req);

    if (user) {
        // User is logged in, allow access to the next route handler
        next();
    } else {
        // User is not logged in, redirect to a login page or display an unauthorized message
        res.redirect("/");
    }
}

// Export the functions to use in other parts of your application
module.exports = {
    requireLogin,
    checkUserLoggedIn,
    saveUserDataToCookies,
    clearUserDataFromCookies,
    isDriver,
    isAdmin,
    isExaminer,
};

import express from "express";
import mysql from "mysql";
import cors from "cors";
import bodyParser from "body-parser";

const app = express();
app.use(cors());


app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true }));


// Data Base Connection COde
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "gym_fitness"
});

// You should listen for the "connect" event on the MySQL connection.
db.connect((error) => {
    if (error) {
        console.error('Error connecting to database:', error);
    } else {
        console.log('Connected to the database');
    }
});


// Register New User API and End Point is "addUser"

app.post('/addUser', (req, res) => {
    const user = {
        user_name: req.body.user_name,
        contact_no: req.body.contact_no,
        email: req.body.email,
        gender: req.body.gender,
        password: req.body.password,
    };

    // Regular expression to validate phone number format (example: +1234567890)
    const phoneRegex = /^\+?[0-9]+$/;

    if (!phoneRegex.test(user.contact_no)) {
        return res.status(400).json({ message: 'Invalid phone number format' });
    }

    // Check if the contact_no is already used
    const checkQuery = "SELECT COUNT(*) AS count FROM user WHERE contact_no = ?";
    db.query(checkQuery, [user.contact_no], (checkError, checkResults) => {
        if (checkError) {
            console.error('Error checking for existing contact_no:', checkError);
            return res.status(500).json({ message: 'Error checking contact_no' });
        }

        const existingCount = checkResults[0].count;
        if (existingCount > 0) {
            return res.status(409).json({ message: 'Contact number already exists' });
        }

        const insertQuery = "INSERT INTO user (user_name, contact_no, email, gender, password) VALUES (?, ?, ?, ?, ?)";
        db.query(insertQuery, [user.user_name, user.contact_no, user.email, user.gender, user.password], (insertError, insertResults) => {
            if (insertError) {
                console.error('Error inserting user:', insertError);
                return res.status(500).json({ message: 'Error inserting user' });
            }

            return res.status(201).json({ message: 'success' });
        });
    });
});



// Login APi login through Contact_no and password and Endpoint is "login".
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    const selectQuery = "SELECT * FROM user WHERE email = ?";
    db.query(selectQuery, [email], (error, results) => {
        if (error) {
            console.error('Error retrieving user:', error);
            return res.status(500).json({ message: 'Error retrieving user' });
        }

        if (results.length === 0) {
            return res.status(401).json({ message: 'User not found' });
        }

        const user = results[0];
        if (user.password !== password) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        // Successful login
        return res.status(200).json({ message: "Login Successful", user: user });
    });
});



const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

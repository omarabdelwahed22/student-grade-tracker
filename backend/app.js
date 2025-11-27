const express = require("express")
const path = require("path")
const app = express()
const PORT = 3000

app.use(express.json());

// Serve static frontend files from ../frontend (project root)
app.use(express.static(path.join(__dirname, '..', 'frontend')));

const grades = require("./routes/grades");
app.use("/grades", grades);

const auth = require("./routes/auth");
app.use("/", auth);

// Serve login page at root
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'login.html'))
})

app.listen(PORT, () => console.log(`Server is running on port: ${PORT}`));
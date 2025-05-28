require("dotenv").config();
const express = require("express");
const cors = require("cors");
const session = require("express-session");
const cookieParser = require("cookie-parser");

const usersRoutes = require("./routes/users");
const animalsRoutes = require("./routes/animals");
const chatRoutes = require("./routes/chat");

const app = express();
app.use(
  cors({
    origin: "http://localhost:5173", // Cambia si tu frontend está en otro puerto
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_SECRET || "supersecretkey",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // true si usas https
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 días
    },
  })
);

app.use("/api/users", usersRoutes);
app.use("/api/animals", animalsRoutes);
app.use("/api/chat", chatRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor backend escuchando en el puerto ${PORT}`);
});

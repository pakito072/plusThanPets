require("dotenv").config();
const express = require("express");
const cors = require("cors");

const usersRoutes = require("./routes/users");
const animalsRoutes = require("./routes/animals");
const chatRoutes = require("./routes/chat");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/users", usersRoutes);
app.use("/api/animals", animalsRoutes);
app.use("/api/chat", chatRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor backend escuchando en el puerto ${PORT}`);
});

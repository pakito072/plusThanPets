require("dotenv").config();
const express = require("express");
const cors = require("cors");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const http = require("http");
const { Server } = require("socket.io");
const db = require("./db");

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

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});

// Lógica de chat en tiempo real
io.on("connection", (socket) => {
  // Unirse a la sala de un animal
  socket.on("join_room", ({ animal_id }) => {
    socket.join(`room_${animal_id}`);
  });

  // Recibir y reenviar mensajes
  socket.on("send_message", async ({ animal_id, sender_id, message }) => {
    // Comprobar si el animal ya tiene un chat de adopción abierto
    db.query(
      "SELECT id FROM chat_rooms WHERE animal_id = ?",
      [animal_id],
      (err, results) => {
        if (err) return;
        let room_id;
        if (results.length > 0) {
          room_id = results[0].id;
          saveAndEmit(room_id);
        } else {
          // RESTRICCIONES DE ADOPCIÓN
          // 1. El usuario no puede tener más de un chat de adopción abierto
          db.query(
            `SELECT cr.id FROM chat_rooms cr
             JOIN chat_messages cm ON cr.id = cm.room_id
             WHERE cm.sender_id = ?`,
            [sender_id],
            (err2, userChats) => {
              if (err2) return;
              if (userChats.length > 0) {
                // Ya tiene un chat abierto
                socket.emit("chat_error", {
                  error:
                    "Solo puedes tener un chat de adopción abierto a la vez.",
                });
                return;
              }
              // 2. El animal no puede estar en dos chats de adopción a la vez
              db.query(
                "SELECT id FROM chat_rooms WHERE animal_id = ?",
                [animal_id],
                (err3, animalChats) => {
                  if (err3) return;
                  if (animalChats.length > 0) {
                    socket.emit("chat_error", {
                      error:
                        "Este animal ya tiene un chat de adopción abierto.",
                    });
                    return;
                  }
                  // Si pasa ambas restricciones, crear el chat
                  db.query(
                    "INSERT INTO chat_rooms (animal_id, created_at) VALUES (?, NOW())",
                    [animal_id],
                    (err, result) => {
                      if (err) return;
                      room_id = result.insertId;
                      saveAndEmit(room_id);
                    }
                  );
                }
              );
            }
          );
        }

        function saveAndEmit(room_id) {
          db.query(
            "INSERT INTO chat_messages (room_id, sender_id, message, created_at) VALUES (?, ?, ?, NOW())",
            [room_id, sender_id, message],
            (err, result) => {
              if (err) return;
              io.to(`room_${animal_id}`).emit("receive_message", {
                room_id,
                sender_id,
                message,
                created_at: new Date(),
              });
            }
          );
        }
      }
    );
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Servidor backend escuchando en el puerto ${PORT}`);
});

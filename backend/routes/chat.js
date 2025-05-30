const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/", (req, res) => {
  res.json({ message: "Rutas de chat funcionando!" });
});

// Obtener todos los chats donde el usuario participa (como interesado o donante)
router.get("/user/:userId", (req, res) => {
  const userId = parseInt(req.params.userId);
  // Chats como interesado (solo los relacionados con el usuario)
  const adoptionChatsQuery = `
    SELECT cr.id as room_id, cr.animal_id, a.name as animal_name, a.owner_id, u.username as owner_name,
           MAX(cm.created_at) as last_message_at, MAX(cm.id) as last_message_id
    FROM chat_rooms cr
    JOIN animals a ON cr.animal_id = a.id
    JOIN users u ON a.owner_id = u.id
    LEFT JOIN chat_messages cm ON cr.id = cm.room_id
    WHERE cr.id IN (
      SELECT room_id FROM chat_messages WHERE sender_id = ?
      UNION
      SELECT id FROM chat_rooms WHERE animal_id IN (SELECT id FROM animals WHERE adopted_by IS NULL OR adopted_by = 0) AND id NOT IN (SELECT room_id FROM chat_messages)
        AND NOT EXISTS (SELECT 1 FROM chat_messages WHERE room_id = cr.id AND sender_id != ?)
        AND NOT EXISTS (SELECT 1 FROM chat_messages WHERE room_id = cr.id AND sender_id = ? AND sender_id != ?)
    )
    GROUP BY cr.id
    ORDER BY last_message_at DESC
  `;
  // Chats como donante (dueño del animal)
  const donationChatsQuery = `
    SELECT cr.id as room_id, cr.animal_id, a.name as animal_name, a.owner_id, u.username as owner_name,
           MAX(cm.created_at) as last_message_at, MAX(cm.id) as last_message_id
    FROM chat_rooms cr
    JOIN animals a ON cr.animal_id = a.id
    JOIN users u ON a.owner_id = u.id
    LEFT JOIN chat_messages cm ON cr.id = cm.room_id
    WHERE a.owner_id = ?
    GROUP BY cr.id
    ORDER BY last_message_at DESC
  `;
  db.query(
    adoptionChatsQuery,
    [userId, userId, userId, userId],
    (err, adoptionChats) => {
      if (err)
        return res
          .status(500)
          .json({ error: "Error en la base de datos (adoption)" });
      db.query(donationChatsQuery, [userId], (err2, donationChats) => {
        if (err2)
          return res
            .status(500)
            .json({ error: "Error en la base de datos (donation)" });
        res.json({ adoptionChats, donationChats });
      });
    }
  );
});

// Obtener historial de mensajes de un chat
router.get("/room/:roomId/messages", (req, res) => {
  const roomId = parseInt(req.params.roomId);
  db.query(
    `SELECT cm.*, u.username FROM chat_messages cm JOIN users u ON cm.sender_id = u.id WHERE cm.room_id = ? ORDER BY cm.created_at ASC`,
    [roomId],
    (err, results) => {
      if (err)
        return res.status(500).json({ error: "Error al obtener mensajes" });
      res.json(results);
    }
  );
});

// Eliminar/cerrar un chat (solo si el usuario es dueño o interesado)
router.delete("/room/:roomId", (req, res) => {
  const roomId = parseInt(req.params.roomId);
  db.query("DELETE FROM chat_rooms WHERE id = ?", [roomId], (err, result) => {
    if (err) return res.status(500).json({ error: "Error al eliminar chat" });
    res.json({ success: true });
  });
});

module.exports = router;

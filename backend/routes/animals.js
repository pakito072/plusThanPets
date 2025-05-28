const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/", (req, res) => {
  res.json({ message: "Rutas de animales funcionando!" });
});

// Crear un nuevo animal (donación)
router.post("/", (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: "No autenticado" });
  }
  const {
    type,
    name,
    breed,
    age,
    gender,
    description,
    image_url,
    location_lat,
    location_lng,
  } = req.body;
  if (
    !type ||
    !name ||
    !breed ||
    !age ||
    !gender ||
    !description ||
    !image_url ||
    !location_lat ||
    !location_lng
  ) {
    return res.status(400).json({ error: "Faltan campos obligatorios" });
  }
  const owner_id = req.session.user.id;
  const sql = `INSERT INTO animals (type, name, breed, age, gender, description, image_url, location_lat, location_lng, owner_id, adopted_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`;
  db.query(
    sql,
    [
      type,
      name,
      breed,
      age,
      gender,
      description,
      image_url,
      location_lat,
      location_lng,
      owner_id,
    ],
    (err, result) => {
      if (err) return res.status(500).json({ error: "Error al donar animal" });
      res.status(201).json({ ok: true, animal_id: result.insertId });
    }
  );
});

// Obtener animales donados por el usuario autenticado
router.get("/my-donated", (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: "No autenticado" });
  }
  const userId = req.session.user.id;
  db.query(
    "SELECT id, type, name, breed, age, gender, description, image_url, created_at FROM animals WHERE owner_id = ? ORDER BY created_at DESC",
    [userId],
    (err, results) => {
      if (err)
        return res
          .status(500)
          .json({ error: "Error al obtener animales donados" });
      res.json(results);
    }
  );
});

module.exports = router;

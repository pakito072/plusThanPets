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
  } = req.body;

  // Validaciones detalladas estilo registro/login
  if (
    !type ||
    !name ||
    !breed ||
    !age ||
    !gender ||
    !description ||
    !image_url
  ) {
    return res.status(400).json({ error: "Faltan campos obligatorios" });
  }
  if (typeof age !== "number" || isNaN(age) || age <= 0) {
    return res
      .status(400)
      .json({ error: "La edad debe ser un número mayor que 0" });
  }
  if (!["male", "female"].includes(gender)) {
    return res
      .status(400)
      .json({ error: "El género debe ser 'Macho' o 'Hembra'" });
  }
  if (typeof name !== "string" || name.length < 2) {
    return res
      .status(400)
      .json({ error: "El nombre debe tener al menos 2 caracteres" });
  }
  if (typeof breed !== "string" || breed.length < 2) {
    return res
      .status(400)
      .json({ error: "La raza debe tener al menos 2 caracteres" });
  }
  if (typeof description !== "string" || description.length < 10) {
    return res
      .status(400)
      .json({ error: "La descripción debe tener al menos 10 caracteres" });
  }
  // Puedes añadir más validaciones si lo deseas

  const owner_id = req.session.user.id;
  const sql = `INSERT INTO animals (type, name, breed, age, gender, description, image_url, owner_id, adopted_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)`;
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

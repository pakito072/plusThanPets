const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/", (req, res) => {
  const onlyAvailable = req.query.available === "1";
  let sql = "SELECT * FROM animals";
  let params = [];
  if (onlyAvailable) {
    sql += " WHERE adopted_by IS NULL OR adopted_by = 0";
  }
  db.query(sql, params, (err, results) => {
    if (err)
      return res.status(500).json({ error: "Error al obtener animales" });
    res.json(results);
  });
});

// Crear un nuevo animal (donación)
router.post("/", (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: "No autenticado" });
  }
  const { type, name, breed, age, gender, description, image_url } = req.body;

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
    [type, name, breed, age, gender, description, image_url, owner_id],
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
    "SELECT id, type, name, breed, age, gender, description, image_url, created_at, adopted_by FROM animals WHERE owner_id = ? ORDER BY created_at DESC",
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

// Obtener adopciones del usuario autenticado
router.get("/my-adoptions", (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: "No autenticado" });
  }
  const userId = req.session.user.id;
  const sql = `
    SELECT a.id as adoption_id, a.animal_id, a.date, a.status, a.message,
           an.name as animal_name, an.type as animal_type
    FROM adoptions a
    JOIN animals an ON a.animal_id = an.id
    WHERE a.adopter_id = ?
    ORDER BY a.date DESC
  `;
  db.query(sql, [userId], (err, results) => {
    if (err)
      return res.status(500).json({ error: "Error al obtener adopciones" });
    res.json(results);
  });
});

// Marcar animal como adoptado
router.post("/:id/adopt", (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: "No autenticado" });
  }
  const animalId = parseInt(req.params.id);
  const { adopter_id } = req.body;
  if (!adopter_id) {
    return res.status(400).json({ error: "Falta el id del adoptante" });
  }
  // Solo puede adoptar si el animal no está adoptado
  db.query(
    "UPDATE animals SET adopted_by = ? WHERE id = ? AND (adopted_by IS NULL OR adopted_by = 0)",
    [adopter_id, animalId],
    (err, result) => {
      if (err)
        return res.status(500).json({ error: "Error al actualizar adopción" });
      if (result.affectedRows === 0)
        return res
          .status(400)
          .json({ error: "El animal ya está adoptado o no existe" });
      res.json({ ok: true });
    }
  );
});

// Obtener animales adoptados por el usuario autenticado
router.get("/my-adopted", (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: "No autenticado" });
  }
  const userId = req.session.user.id;
  db.query(
    "SELECT id, type, name, breed, age, gender, description, image_url, created_at, owner_id FROM animals WHERE adopted_by = ? ORDER BY created_at DESC",
    [userId],
    (err, results) => {
      if (err)
        return res
          .status(500)
          .json({ error: "Error al obtener animales adoptados" });
      res.json(results);
    }
  );
});

module.exports = router;

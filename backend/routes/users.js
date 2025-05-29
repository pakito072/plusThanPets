const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/", (req, res) => {
  res.json({ message: "Rutas de usuarios funcionando!" });
});

// Registro de usuario
router.post("/register", (req, res) => {
  const { username, email, password, gender } = req.body;
  if (!username || !email || !password || !gender) {
    return res.status(400).json({ error: "Faltan campos obligatorios" });
  }
  // Comprobar si el usuario ya existe
  db.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
    if (err)
      return res.status(500).json({ error: "Error en la base de datos" });
    if (results.length > 0) {
      return res.status(400).json({ error: "El email ya está registrado" });
    }
    // Insertar nuevo usuario (incluyendo género)
    db.query(
      "INSERT INTO users (username, email, password, gender) VALUES (?, ?, ?, ?)",
      [username, email, password, gender],
      (err, result) => {
        if (err)
          return res.status(500).json({ error: "Error al registrar usuario" });
        // Devolver el usuario creado (sin contraseña)
        const newUser = { id: result.insertId, username, email, gender };
        res.status(201).json({ user: newUser });
      }
    );
  });
});

// Login de usuario
router.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Faltan email o contraseña" });
  }
  db.query(
    "SELECT id, username, email, gender, password FROM users WHERE email = ?",
    [email],
    (err, results) => {
      if (err)
        return res.status(500).json({ error: "Error en la base de datos" });
      if (results.length === 0) {
        return res.status(400).json({ error: "Usuario no encontrado" });
      }
      const user = results[0];
      if (user.password !== password) {
        return res.status(400).json({ error: "Contraseña incorrecta" });
      }
      // Guardar usuario en sesión
      req.session.user = {
        id: user.id,
        username: user.username,
        email: user.email,
        gender: user.gender,
      };
      // No enviar la contraseña al frontend
      delete user.password;
      res.status(200).json({ user: req.session.user });
    }
  );
});

// Obtener usuario autenticado (autologin)
router.get("/me", (req, res) => {
  if (req.session.user) {
    res.json(req.session.user);
  } else {
    res.status(401).json({ error: "No autenticado" });
  }
});

// Actualizar datos del usuario autenticado (incluye cambio de contraseña)
router.put("/me", (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: "No autenticado" });
  }
  const userId = req.session.user.id;
  const { username, gender, password } = req.body;
  let sql = `UPDATE users SET username = ?, gender = ?`;
  let params = [username, gender];
  if (password && password.length >= 4) {
    sql += `, password = ?`;
    params.push(password);
  }
  sql += ` WHERE id = ?`;
  params.push(userId);
  db.query(sql, params, (err) => {
    if (err)
      return res.status(500).json({ error: "Error al actualizar usuario" });
    db.query("SELECT * FROM users WHERE id = ?", [userId], (err2, results) => {
      if (err2 || !results[0])
        return res
          .status(500)
          .json({ error: "Error al obtener usuario actualizado" });
      // No enviar la contraseña
      const { password, ...userData } = results[0];
      req.session.user = userData;
      res.json(userData);
    });
  });
});

// Logout de usuario
router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ error: "Error al cerrar sesión" });
    res.clearCookie("connect.sid");
    res.json({ ok: true });
  });
});

module.exports = router;

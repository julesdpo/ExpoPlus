import {
  getAllUsers,
  findUserById,   // <-- correction
  deleteUser,
  updateUserRole,
} from "../models/users.model.js";

export async function listUsers(req, res) {
  try {
    const users = await getAllUsers();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
}

export async function getUser(req, res) {
  try {
    const user = await findUserById(req.params.id); // <-- correction
    if (!user) return res.status(404).json({ error: "User introuvable" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
}

export async function removeUser(req, res) {
  try {
    const removed = await deleteUser(req.params.id);
    if (!removed) return res.status(404).json({ error: "User introuvable" });
    res.json({ deleted: true, user: removed });
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
}

export async function changeUserRole(req, res) {
  try {
    const { role } = req.body;
    if (!role) return res.status(400).json({ error: "role manquant" });

    const updated = await updateUserRole(req.params.id, role);
    if (!updated) return res.status(404).json({ error: "User introuvable" });

    res.json({ updated: true, user: updated });
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
}

import {
  getAllUsers,
  findUserById,
  deleteUser,
  updateUserRole,
} from "../models/users.model.js";
import { logInfo, logError } from "../utils/logger.js"; // Assurez-vous que ce module existe

export async function listUsers(req, res) {
  try {
    logInfo("Admin list users", req);
    const users = await getAllUsers();
    res.json(users);
  } catch (err) {
    logError("User admin error: " + err.message, req);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

export async function getUser(req, res) {
  try {
    logInfo("Admin get user " + req.params.id, req);
    const user = await findUserById(req.params.id);
    if (!user) return res.status(404).json({ error: "User introuvable" });
    res.json(user);
  } catch (err) {
    logError("User admin error: " + err.message, req);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

export async function removeUser(req, res) {
  try {
    logInfo("Admin delete user " + req.params.id, req);
    const removed = await deleteUser(req.params.id);
    if (!removed) return res.status(404).json({ error: "User introuvable" });
    res.json({ deleted: true, user: removed });
  } catch (err) {
    logError("User admin error: " + err.message, req);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

export async function changeUserRole(req, res) {
  try {
    logInfo("Admin update role " + req.params.id, req);
    const { role } = req.body;
    if (!role) return res.status(400).json({ error: "role manquant" });

    const updated = await updateUserRole(req.params.id, role);
    if (!updated) return res.status(404).json({ error: "User introuvable" });

    res.json({ updated: true, user: updated });
  } catch (err) {
    logError("User admin error: " + err.message, req);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

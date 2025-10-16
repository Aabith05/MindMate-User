import express from "express";
import { getCaretakers, getPatients, assignPatient } from "../controllers/caretaker.controller.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.get("/", auth, getCaretakers);
router.get("/:id/patients", auth, getPatients);
router.post("/assign", auth, assignPatient);

export default router;
import Caretaker from "../models/Caretaker.model.js";
import User from "../models/User.model.js";

// Get all caretakers
export const getCaretakers = async (req, res) => {
  try {
    const caretakers = await Caretaker.find().populate("patients", "name email photo");
    res.json(caretakers);
  } catch (err) {
    res.status(500).json({ message: "Error fetching caretakers" });
  }
};

// Get patients for a specific caretaker
export const getPatients = async (req, res) => {
  try {
    const caretaker = await Caretaker.findById(req.params.id).populate("patients", "name email photo");
    if (!caretaker) return res.status(404).json({ message: "Caretaker not found" });
    res.json(caretaker.patients);
  } catch (err) {
    res.status(500).json({ message: "Error fetching patients" });
  }
};

// Assign a patient to a caretaker
export const assignPatient = async (req, res) => {
  try {
    const { caretakerId, patientId } = req.body;
    const caretaker = await Caretaker.findById(caretakerId);
    if (!caretaker) return res.status(404).json({ message: "Caretaker not found" });

    if (!caretaker.patients.includes(patientId)) {
      caretaker.patients.push(patientId);
      await caretaker.save();
    }
    res.json({ message: "Patient assigned successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error assigning patient" });
  }
};
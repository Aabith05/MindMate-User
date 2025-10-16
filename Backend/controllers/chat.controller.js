import Chat from "../models/Chat.model.js";
import User from "../models/User.model.js";

// Only used for fetching
export const getMessages = async (req, res) => {
  const { userId } = req.params;
  const myId = req.user._id;

  try {
    const messages = await Chat.find({
      $or: [
        { sender: myId, receiver: userId },
        { sender: userId, receiver: myId },
      ],
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: "Error fetching messages" });
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await User.find({}, "name email _id");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Error fetching users" });
  }
};

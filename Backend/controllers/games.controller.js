import Games from "../models/games.model.js";

const getAllGames = async (req, res) => {
  try {
    const games = await Games.find({});
    res.status(200).json(games);
  } catch (err) {
    console.error("Error fetching games:", err);
    res.status(500).json({ message: "Server error fetching games" });
  }};
const getGameById = async (req, res) => {
  const { id } = req.params;
    try { 
        const game = await Games.findOne({id:id});
        if(!game){
            return res.status(404).json({message:"Game not found"});
        }
        res.status(200).json(game);
    } catch (err) {
        console.error("Error fetching game by ID:", err);
        res.status(500).json({ message: "Server error fetching game by ID" });
    }       
};

export default { getAllGames , getGameById};
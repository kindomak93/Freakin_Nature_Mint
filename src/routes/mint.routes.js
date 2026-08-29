import express from "express";
import { mintNft } from "../controllers/mint.controller.js";

const router = express.Router();

router.post("/mint", mintNft);

export default router;
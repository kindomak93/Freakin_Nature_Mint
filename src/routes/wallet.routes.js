import express from "express";

import { createWallet} from "../controllers/wallet.controller.js";

const router = express.Router();

router.post("/create_wallet", createWallet);

export default router;
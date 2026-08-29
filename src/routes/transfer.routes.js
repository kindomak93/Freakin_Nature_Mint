import express from "express";

import {transferNft} from "../controllers/transfer.controller.js";

const router = express.Router();

router.post("/transfer_nft", transferNft);

export default router;
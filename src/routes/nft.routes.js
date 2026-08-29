import express from "express";

import {getUserNfts} from "../controllers/nft.controller.js";

const router = express.Router();

router.post("/get_nfts", getUserNfts);

export default router;
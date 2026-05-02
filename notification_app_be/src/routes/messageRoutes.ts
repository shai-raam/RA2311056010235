import { Router } from "express";
import {
  getMessages,
  postMessage,
  patchMessage,
} from "../controllers/messageHandler";
import { Log } from "../logger";

const router = Router();

router.get("/messages", async (req, res) => {
  await Log("backend", "info", "route", "incoming GET /messages request");
  await getMessages(req, res);
});

router.post("/messages", async (req, res) => {
  await Log("backend", "info", "route", "incoming POST /messages request");
  await postMessage(req, res);
});

router.patch("/messages/:id", async (req, res) => {
  await Log("backend", "info", "route", `incoming PATCH /messages/${req.params.id} request`);
  await patchMessage(req, res);
});

export default router;

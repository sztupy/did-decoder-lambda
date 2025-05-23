import { Router } from "express";
const router = Router();

router.get("/cache", async (req, res) => {
  res.json(req.params);
});

export default router;

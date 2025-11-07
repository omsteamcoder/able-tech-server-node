import express from "express";
import {
  getMenu,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  updateMenuStructure,
  addPagesToMenuHandler,
  updateMenuOrder,
} from "../controllers/menuController.js";

const router = express.Router();

// GET /api/menu - Retrieve the entire menu structure
router.get("/", getMenu);

// DELETE /api/menu/delete - Alternative delete endpoint (keep for backward compatibility)
router.delete("/delete", deleteMenuItem);
router.put("/reorder", updateMenuOrder);
// Special endpoints
router.put("/structure", updateMenuStructure);
router.post("/add-page-menu-items", addPagesToMenuHandler);

// POST /api/menu - Create a new menu item
router.post("/", createMenuItem);

// PUT /api/menu/:id - Update an existing menu item
router.put("/:id", updateMenuItem);

// DELETE /api/menu/:id - Delete a menu item
router.delete("/:id", deleteMenuItem);

export default router;

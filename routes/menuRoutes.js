import express from "express";
import {
  getMenu,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  updateMenuStructure,
  addPagesToMenuHandler,
  updateMenuOrder
} from "../controllers/menuController.js";

const router = express.Router();

// GET /api/menu - Retrieve the entire menu structure
router.get("/", getMenu);

// POST /api/menu - Create a new menu item
router.post("/", createMenuItem);

// PUT /api/menu/:id - Update an existing menu item
router.put("/:id", updateMenuItem);

// DELETE /api/menu/:id - Delete a menu item  
router.delete("/:id", deleteMenuItem);

// DELETE /api/menu/delete - Alternative delete endpoint (keep for backward compatibility)
router.delete("/delete", deleteMenuItem);

// Special endpoints
router.put("/update-structure", updateMenuStructure);
router.post('/add-page-menu-items', addPagesToMenuHandler);
router.put('/order', updateMenuOrder);

export default router;
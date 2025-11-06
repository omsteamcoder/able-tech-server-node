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
router.put("/update-structure", updateMenuStructure);
router.get("/", getMenu);

// POST /api/menu - Create a new menu item
router.post("/", createMenuItem);

// PUT /api/menu/:id - Update an existing menu item
router.put("/update", updateMenuItem);

// DELETE /api/menu/:id - Delete a menu item
router.delete("/delete", deleteMenuItem);

router.post('/add-page-menu-items', addPagesToMenuHandler);

router.put('/order', updateMenuOrder)
export default router;

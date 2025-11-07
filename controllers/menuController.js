import mongoose from "mongoose";
import MenuItem from "../models/menuModel.js";
import Page from "../models/pageModel.js";

// Get all menu items in a hierarchical structure
export const getMenu = async (req, res) => {
  try {
    const items = await MenuItem.find().sort({ order: 1 }).lean();
    const menuHierarchy = buildMenuHierarchy(items);
    res.status(200).json(menuHierarchy);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper function to build a hierarchical structure
function buildMenuHierarchy(items) {
  const itemMap = {};
  items.forEach((item) => (itemMap[item._id] = { ...item, children: [] }));

  const hierarchy = [];
  items.forEach((item) => {
    if (item.parent) {
      itemMap[item.parent]?.children.push(itemMap[item._id]);
    } else {
      hierarchy.push(itemMap[item._id]);
    }
  });

  return hierarchy;
}

export const createMenuItem = async (req, res) => {
  const { title, link, parent = null } = req.body;

  try {
    const parentItem = parent ? await MenuItem.findById(parent) : null;
    const level = parentItem ? parentItem.level + 1 : 0;

    const lastOrder = await MenuItem.find({ parent })
      .sort({ order: -1 })
      .limit(1);
    const order = lastOrder.length ? lastOrder[0].order + 1 : 1;

    const newItem = await MenuItem.create({
      title,
      link,
      parent,
      level,
      order,
    });

    // FIX: Return consistent response format
    res.status(201).json({
      success: true,
      data: newItem,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// Enhanced updateMenuItem to handle hierarchy changes - FIXED
export const updateMenuItem = async (req, res) => {
  console.log("hehehjdsjdnksda ", req.body);

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id, title, link, parent, level, order } = req.body;

    if (!id || !title) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const movedItem = await MenuItem.findById(id).session(session);
    if (!movedItem) {
      return res.status(404).json({ message: "Item not found" });
    }

    // Check for circular reference
    if (parent && (await isCircularReference(id, parent))) {
      return res
        .status(400)
        .json({ message: "Cannot set item as parent of its own descendant" });
    }

    // FIX: Calculate correct level based on parent
    let actualLevel = 0;
    if (parent) {
      const parentItem = await MenuItem.findById(parent).session(session);
      actualLevel = parentItem ? parentItem.level + 1 : 0;
    }

    const parentChanged = movedItem.parent?.toString() !== parent;
    const levelChanged = movedItem.level !== actualLevel;

    // Update the item
    const updatedItem = await MenuItem.findByIdAndUpdate(
      id,
      { title, link, parent: parent || null, level: actualLevel, order },
      { new: true, session }
    );

    // Update descendants if parent or level changed
    if (parentChanged || levelChanged) {
      await updateDescendants(updatedItem._id, updatedItem.level, session);
    }

    // Adjust sibling orders
    await adjustSiblingOrders(updatedItem.parent, session);

    await session.commitTransaction();
    res.status(200).json({
      success: true, // ADD THIS
      data: updatedItem,
    });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ message: error.message });
  } finally {
    session.endSession();
  }
};

// menuController.js - UPDATE this function
const updateChildLevelsAndParents = async (
  parentId,
  level,
  children,
  session
) => {
  if (!Array.isArray(children)) return;

  for (const child of children) {
    if (!child._id) {
      console.error("Child item missing _id:", child);
      continue;
    }

    console.log(`Updating child ID: ${child._id}`);
    console.log(
      `Details - Title: ${child.title}, Link: ${child.link}, New Parent: ${parentId}, Level: ${level}, Order: ${child.order}`
    );

    try {
      // FIX: Calculate correct level based on parent
      const childLevel = level;

      // Update each child with new parent, level, order, and link
      await MenuItem.findByIdAndUpdate(
        child._id,
        {
          title: child.title,
          parent: parentId,
          level: childLevel,
          order: child.order,
          link: child.link,
        },
        { session }
      );

      console.log(
        `Updated child: ${child.title} (ID: ${child._id}) with Parent: ${parentId}, Level: ${childLevel}, Order: ${child.order}`
      );

      // Recursively update if the child has its own children
      if (child.children && child.children.length > 0) {
        await updateChildLevelsAndParents(
          child._id,
          childLevel + 1,
          child.children,
          session
        );
      }
    } catch (error) {
      console.error(
        `Error updating child ID: ${child._id}, Error: ${error.message}`
      );
    }
  }
};

// Check for circular references
const isCircularReference = async (itemId, potentialParentId) => {
  if (itemId.toString() === potentialParentId.toString()) {
    return true;
  }

  let currentParentId = potentialParentId;
  while (currentParentId) {
    const parent = await MenuItem.findById(currentParentId);
    if (!parent) break;

    if (parent._id.toString() === itemId.toString()) {
      return true;
    }

    currentParentId = parent.parent;
  }

  return false;
};

// Update descendants' levels
const updateDescendants = async (parentId, parentLevel, session) => {
  const children = await MenuItem.find({ parent: parentId }).session(session);

  for (const child of children) {
    await MenuItem.findByIdAndUpdate(
      child._id,
      { level: parentLevel + 1 },
      { session }
    );

    // Recursively update grandchildren
    await updateDescendants(child._id, parentLevel + 1, session);
  }
};

export const deleteMenuItem = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params; // Changed from req.query to req.params

    if (!id) {
      return res.status(400).json({ message: "Item ID is required" });
    }

    // Find the item and its descendants
    const itemToDelete = await MenuItem.findById(id).session(session);
    if (!itemToDelete) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    // Recursively delete all descendants
    await deleteDescendants(id, session);

    // Delete the main item
    await MenuItem.findByIdAndDelete(id, { session });

    // Adjust orders of remaining siblings
    await adjustSiblingOrders(itemToDelete.parent, session);

    await session.commitTransaction();
    res.status(200).json({
      success: true, // ADD THIS
      message: "Menu item and its children deleted successfully",
    });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ message: error.message });
  } finally {
    session.endSession();
  }
};
// Recursively delete descendants
const deleteDescendants = async (parentId, session) => {
  const children = await MenuItem.find({ parent: parentId }).session(session);

  for (const child of children) {
    await deleteDescendants(child._id, session);
    await MenuItem.findByIdAndDelete(child._id, { session });
  }
};

// Adjust sibling orders after an item has been moved - ENHANCED
const adjustSiblingOrders = async (parentId, session) => {
  try {
    const siblings = await MenuItem.find({ parent: parentId })
      .sort({ order: 1 })
      .session(session);

    for (let i = 0; i < siblings.length; i++) {
      await MenuItem.findByIdAndUpdate(
        siblings[i]._id,
        { order: i + 1 },
        { session }
      );
    }
  } catch (error) {
    console.error("Error adjusting sibling orders:", error);
    throw error;
  }
};
// menuController.js - UPDATE updateMenuStructure function
export const updateMenuStructure = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { menu } = req.body;
    console.log("Received menu structure:", menu);

    if (!Array.isArray(menu)) {
      return res.status(400).json({ message: "Menu must be an array" });
    }

    // Process each item in the menu structure to update hierarchy
    for (const item of menu) {
      if (!item._id) {
        console.error("Error: Item missing _id:", item);
        continue;
      }

      console.log(`Updating item ID: ${item._id}`);
      console.log(
        `Details - Name: ${item.title}, Link: ${item.link}, Parent: ${
          item.parent || "null"
        }, Level: ${item.level}, Order: ${item.order}`
      );

      // FIX: Validate level consistency
      let actualLevel = 0;
      if (item.parent) {
        const parentItem = await MenuItem.findById(item.parent).session(
          session
        );
        if (parentItem) {
          actualLevel = parentItem.level + 1;
        } else {
          // If parent doesn't exist, treat as root level
          actualLevel = 0;
        }
      }

      // FIX: Ensure level matches parent relationship
      if (item.parent && actualLevel !== item.level) {
        console.warn(
          `Correcting level for item ${item._id} from ${item.level} to ${actualLevel}`
        );
      }

      // Update the item with the new parent relationship, order, level, and link
      await MenuItem.findByIdAndUpdate(
        item._id,
        {
          title: item.title,
          parent: item.parent || null,
          order: item.order,
          level: actualLevel, // Use calculated level instead of provided level
          link: item.link,
        },
        { session }
      );

      console.log(
        `Updated item: ${item.title} (ID: ${item._id}) with Parent: ${
          item.parent || "null"
        }, Level: ${actualLevel}, Order: ${item.order}`
      );

      // If this item has children, recursively update their levels and parents
      if (item.children && item.children.length > 0) {
        await updateChildLevelsAndParents(
          item._id,
          actualLevel + 1,
          item.children,
          session
        );
      }
    }

    await session.commitTransaction();
    res.status(200).json({
      success: true, // ADD THIS for frontend validation
      message: "Menu structure updated successfully",
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("Error updating menu structure:", error.message);
    res.status(500).json({
      success: false, // ADD THIS for frontend validation
      message: "Error updating menu structure",
      error: error.message,
    });
  } finally {
    session.endSession();
  }
};

export const updateMenuOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { draggedId, targetId, position } = req.body; // position: 'before', 'after', 'into'

    if (!draggedId || !targetId) {
      return res.status(400).json({ message: "Missing required parameters" });
    }

    const draggedItem = await MenuItem.findById(draggedId).session(session);
    const targetItem = await MenuItem.findById(targetId).session(session);

    if (!draggedItem || !targetItem) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    let newParent = null;
    let newLevel = 0;
    let newOrder = 0;

    switch (position) {
      case "before":
      case "after":
        newParent = targetItem.parent;
        newLevel = targetItem.level;
        // Get siblings to calculate order
        const siblings = await MenuItem.find({ parent: newParent })
          .sort({ order: 1 })
          .session(session);

        const targetIndex = siblings.findIndex(
          (sib) => sib._id.toString() === targetId
        );
        newOrder = position === "before" ? targetIndex : targetIndex + 1;
        break;

      case "into":
        newParent = targetId;
        newLevel = targetItem.level + 1;
        // Get children count for order
        const childrenCount = await MenuItem.countDocuments({
          parent: targetId,
        }).session(session);
        newOrder = childrenCount;
        break;

      default:
        return res.status(400).json({ message: "Invalid position" });
    }

    // Update the dragged item
    await MenuItem.findByIdAndUpdate(
      draggedId,
      {
        parent: newParent,
        level: newLevel,
        order: newOrder,
      },
      { session }
    );

    // Reorder all affected items
    await adjustSiblingOrders(newParent, session);
    if (draggedItem.parent !== newParent) {
      await adjustSiblingOrders(draggedItem.parent, session);
    }

    // Update descendants levels if level changed
    if (draggedItem.level !== newLevel) {
      await updateDescendants(draggedId, newLevel, session);
    }

    await session.commitTransaction();
    res.status(200).json({ message: "Menu order updated successfully" });
  } catch (error) {
    await session.abortTransaction();
    console.error("Error updating menu order:", error);
    res.status(500).json({ error: "Failed to update menu order" });
  } finally {
    session.endSession();
  }
};

// export async function addPagesToMenu(pageIds) {
//   // Fetch only the necessary fields (name and slug) for each page
//   const pages = await Page.find({ _id: { $in: pageIds } }).select('name slug');

//   // Map the fetched pages to create menu item objects
//   const menuItems = pages.map((page, index) => ({
//     name: page.name, // Use the page name as the menu item name
//     // link: page.slug, // Use the page slug as the menu item link
//     link: `${BASE_URL}${page.slug}`, // Use the page slug as the menu item link
//     level: 0,        // Root level by default
//     order: index,    // Preserve order based on selection
//   }));

//   // Insert the menu items into the MenuItem collection
//   await MenuItem.insertMany(menuItems);
// }

export async function addPagesToMenu(pageIds) {
  // Fetch only the necessary fields (name and slug) for each page
  const pages = await Page.find({ _id: { $in: pageIds } }).select("title slug");

  // Find the current maximum order value in the MenuItem collection
  const maxOrderItem = await MenuItem.findOne().sort("-order");
  const startingOrder = maxOrderItem ? maxOrderItem.order + 1 : 0;

  // Map the fetched pages to create menu item objects, starting from the last order position
  const menuItems = pages.map((page, index) => ({
    title: page.title, // Use the page name as the menu item name
    link: `/${page.slug}`, // Combine base URL and slug for full link
    level: 0, // Root level by default
    order: startingOrder + index, // Set order to continue from the current max order
  }));

  // Insert the menu items into the MenuItem collection
  await MenuItem.insertMany(menuItems);
}

// Route handler function
export async function addPagesToMenuHandler(req, res) {
  try {
    const { pageIds } = req.body;
    console.log(req.body);

    if (!Array.isArray(pageIds) || pageIds.length === 0) {
      return res.status(400).json({
        message: "Invalid request: pageIds must be a non-empty array",
      });
    }

    await addPagesToMenu(pageIds);
    res.status(201).json({ message: "Menu items added successfully!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

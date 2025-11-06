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

// Create a new menu item
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
    res.status(201).json(newItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update an existing menu item

// export const updateMenuItem = async (req, res) => {
//   const session = await mongoose.startSession();
//   session.startTransaction();

//   try {
//     const { id, name, link, parent, level, order } = req.body;
//     const movedItem = await MenuItem.findById(id).session(session);

//     if (!movedItem) return res.status(404).json({ message: "Item not found" });

//     const parentChanged = movedItem.parent?.toString() !== parent;
//     const levelChanged = movedItem.level !== level;

//     const updatedItem = await MenuItem.findByIdAndUpdate(
//       id,
//       { name, link, parent, level, order },
//       { new: true, session }
//     );

//     if (parentChanged || levelChanged) {
//       await updateDescendants(updatedItem._id, updatedItem.level, session);
//     }

//     await adjustSiblingOrders(updatedItem.parent, session);

//     await session.commitTransaction();
//     res.status(200).json(updatedItem);
//   } catch (error) {
//     await session.abortTransaction();
//     res.status(500).json({ message: error.message });
//   } finally {
//     session.endSession();
//   }
// };

export const updateMenuItem = async (req, res) => {
  try {
    const { id, name, link } = req.body;

    // Validate input
    if (!id || !name || !link) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Update only the name and link
    const updatedItem = await MenuItem.findByIdAndUpdate(
      id,
      { name, link },
      { new: true } // Return the updated document
    );

    if (!updatedItem) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    res.status(200).json(updatedItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteMenuItem = async (req, res) => {
  console.log(req.query);

  const { id } = req.query; // Change to req.params for REST consistency

  try {
    await MenuItem.findByIdAndDelete(id);
    res.status(200).json({ message: "Menu item deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Adjust sibling orders after an item has been moved
const adjustSiblingOrders = async (parentId, session) => {
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
};

// Update the entire menu structure
export const updateMenuStructure = async (req, res) => {
  const { menu } = req.body;
  console.log("Received menu structure:", menu);

  try {
    // Process each item in the menu structure to update hierarchy
    for (const item of menu) {
      if (!item._id) {
        console.error("Error: Item missing _id:", item);
        continue; // Skip items without an _id
      }

      console.log(`Updating item ID: ${item._id}`);
      console.log(
        `Details - Name: ${item.title}, Link: ${item.link}, Parent: ${
          item.parent || "null"
        }, Level: ${item.level}, Order: ${item.order}`
      );

      // Update the item with the new parent relationship, order, level, and link
      await MenuItem.findByIdAndUpdate(item._id, {
        parent: item.parent || null,
        order: item.order,
        level: item.level,
        link: item.link,
      });

      console.log(
        `Updated item: ${item.title} (ID: ${item._id}) with Parent: ${
          item.parent || "null"
        }, Level: ${item.level}, Order: ${item.order}`
      );

      // If this item has children, recursively update their levels and parents
      if (item.children && item.children.length > 0) {
        await updateChildLevelsAndParents(
          item._id,
          item.level + 1,
          item.children
        );
      }
    }

    res.status(200).json({ message: "Menu structure updated successfully" });
  } catch (error) {
    console.error("Error updating menu structure:", error.message);
    res
      .status(500)
      .json({ message: "Error updating menu structure", error: error.message });
  }
};

// Recursive function to update levels and parent relationships for children
const updateChildLevelsAndParents = async (parentId, level, children) => {
  for (const child of children) {
    if (!child._id) {
      console.error("Child item missing _id:", child);
      continue;
    }

    console.log(`Updating child ID: ${child._id}`);
    console.log(
      `Details - Name: ${child.name}, Link: ${child.link}, New Parent: ${parentId}, Level: ${level}, Order: ${child.order}`
    );

    try {
      // Update each child with new parent, level, order, and link
      await MenuItem.findByIdAndUpdate(child._id, {
        parent: parentId,
        level: level,
        order: child.order,
        link: child.link,
      });

      console.log(
        `Updated child: ${child.name} (ID: ${child._id}) with Parent: ${parentId}, Level: ${level}, Order: ${child.order}`
      );

      // Recursively update if the child has its own children
      if (child.children && child.children.length > 0) {
        await updateChildLevelsAndParents(child._id, level + 1, child.children);
      }
    } catch (error) {
      console.error(
        `Error updating child ID: ${child._id}, Error: ${error.message}`
      );
    }
  }
};

// Update menu order after drag & drop
export const updateMenuOrder = async (req, res) => {
  try {
    const { menuOrder } = req.body;

    // Update each menu item with its new position
    for (const item of menuOrder) {
      await MenuItem.findByIdAndUpdate(item.id, {
        order: item.position,
        parent: item.parent || null,
      });
    }

    res.status(200).json({ message: "Menu order updated successfully" });
  } catch (error) {
    console.error("Error updating menu order:", error);
    res.status(500).json({ error: "Failed to update menu order" });
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

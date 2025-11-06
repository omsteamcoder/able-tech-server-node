// insertMenu.js
import path from 'path';
import mongoose from 'mongoose';
import MenuItem from './models/menuModel.js'; // Adjust the path as necessary

const insertMenuItems = async () => {
    const menuItemsData = [
        { title: "Home", link: "/new-menu-item" },
        { title: "About", link: "/new-menu-item" },
        { title: "Contact", link: "/new-menu-item" },
        { title: "Updates", link: "/new-menu-item" },
        { title: "Jobs", link: "/new-menu-item" },
        { title: "Persons", link: "/new-menu-item" },
        { title: "Members", link: "/new-menu-item" },
        { title: "Dog", link: "/new-menu-item" },
        { title: "Saree", link: "/new-menu-item" }
    ];

    const menuItemsToInsert = menuItemsData.map((item, index) => ({
        title: item.title,
        link: item.link,
        level: 0,
        id: (index + 1).toString(), // Assuming IDs start from 1
        parentId: null,
        children: [],
        position: index + 1 // Position based on the order in the array
    }));

    try {
        const insertedItems = await MenuItem.insertMany(menuItemsToInsert);
        console.log({
            message: "Menu items created successfully.",
            menuItems: insertedItems
        });
    } catch (error) {
        console.error("Error inserting menu items:", error);
    }
};

// Connect to MongoDB and call the insert function
const connectDBAndInsert = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/abletechWebsite', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log("MongoDB connected successfully.");
        await insertMenuItems();
    } catch (error) {
        console.error("MongoDB connection error:", error);
    } finally {
        mongoose.connection.close();
    }
};

connectDBAndInsert();


//note insert.js

//db.menuitems.find().pretty();


//db.menuitems.drop();

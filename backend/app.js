// Import required modules
import express from "express";
import cors from "cors";
import fs from "fs";

// Initialize the app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// ===== Helper Functions =====

// Read data from file safely
const readDataFromFile = () => {
  try {
    if (fs.existsSync("data.json")) {
      const fileData = fs.readFileSync("data.json", "utf-8");
      return fileData ? JSON.parse(fileData) : [];
    }
    return [];
  } catch (error) {
    console.error("❌ Error reading file:", error);
    return [];
  }
};

// Write data to file safely
const writeDataToFile = (data) => {
  try {
    fs.writeFileSync("data.json", JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("❌ Error writing to file:", error);
  }
};

// Generate a new incremental ID (handles invalid or empty IDs)
const generateId = (dataArray) => {
  if (dataArray.length === 0) return 1;

  // Only use numeric IDs
  const numericIds = dataArray
    .map(item => parseInt(item.id))
    .filter(id => !isNaN(id));

  if (numericIds.length === 0) return 1;

  const maxId = Math.max(...numericIds);
  return maxId + 1;
};

// ===== Routes =====

// Root route
app.get("/", (req, res) => {
  res.send("✅ Server is running...");
});

// ➕ Add new data
app.post("/data", (req, res) => {
  try {
    const existingData = readDataFromFile();
    const newId = generateId(existingData);
    const todoData = { id: newId, ...req.body };

    console.log("🆕 Adding data:", todoData);

    existingData.push(todoData);
    writeDataToFile(existingData);

    console.log("✅ Data saved:", todoData);
    return res.json({ message: "Data added successfully!", data: todoData });
  } catch (error) {
    console.error("❌ Error adding data:", error);
    return res.status(500).json({ error: "Failed to add data" });
  }
});

// 📄 Get all data
app.get("/data", (req, res) => {
  try {
    const data = readDataFromFile();
    console.log("📤 Sending all data:", data);
    return res.json(data);
  } catch (error) {
    console.error("❌ Error reading data:", error);
    return res.status(500).json({ error: "Failed to read data" });
  }
});

// 📄 Get single data by ID
app.get("/data/:id", (req, res) => {
  try {
    const data = readDataFromFile();
    const id = parseInt(req.params.id);
    const item = data.find(item => parseInt(item.id) === id);

    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }

    return res.json(item);
  } catch (error) {
    console.error("❌ Error fetching item:", error);
    return res.status(500).json({ error: "Failed to fetch item" });
  }
});

// ❌ Delete data by ID
app.delete("/data/:id", (req, res) => {
  try {
    const data = readDataFromFile();
    const id = parseInt(req.params.id);
    const filteredData = data.filter(item => parseInt(item.id) !== id);

    if (filteredData.length === data.length) {
      return res.status(404).json({ error: "Item not found" });
    }

    writeDataToFile(filteredData);
    console.log("🗑️ Deleted ID:", id);
    return res.json({ message: "Data deleted successfully!" });
  } catch (error) {
    console.error("❌ Error deleting data:", error);
    return res.status(500).json({ error: "Failed to delete data" });
  }
});

// ✏️ Update data by ID
app.put("/data/:id", (req, res) => {
  try {
    const data = readDataFromFile();
    const id = parseInt(req.params.id);
    const index = data.findIndex(item => parseInt(item.id) === id);

    if (index === -1) {
      return res.status(404).json({ error: "Item not found" });
    }

    const updatedItem = { id, ...req.body };
    data[index] = updatedItem;

    writeDataToFile(data);
    console.log("✏️ Updated data:", updatedItem);
    return res.json({ message: "Data updated successfully!", data: updatedItem });
  } catch (error) {
    console.error("❌ Error updating data:", error);
    return res.status(500).json({ error: "Failed to update data" });
  }
});

// ===== Start the Server =====
const PORT = 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

import { useMemo, useState } from "react";
import {
  Package,
  Search,
  Plus,
  Boxes,
  AlertTriangle,
  CheckCircle2,
  MoreHorizontal,
  TrendingUp,
  Warehouse,
} from "lucide-react";
import { motion } from "framer-motion";
import { TextShuffle, WordMorph } from "../components/AnimatedText";

const card = {
  background: "#fff",
  borderRadius: "20px",
  boxShadow: "0 4px 24px rgba(30,50,40,0.07)",
  border: "1px solid #d4ddd6",
};

const initialInventory = [
  {
    id: "INV-001",
    name: "Premium Teak Wood",
    category: "Raw Material",
    quantity: 120,
    unit: "Sheets",
    minStock: 30,
    status: "In Stock",
  },
  {
    id: "INV-002",
    name: "Oak Wood Panels",
    category: "Raw Material",
    quantity: 18,
    unit: "Sheets",
    minStock: 25,
    status: "Low Stock",
  },
  {
    id: "INV-003",
    name: "Dining Table",
    category: "Finished Goods",
    quantity: 42,
    unit: "Units",
    minStock: 10,
    status: "In Stock",
  },
  {
    id: "INV-004",
    name: "Office Chair",
    category: "Finished Goods",
    quantity: 8,
    unit: "Units",
    minStock: 15,
    status: "Low Stock",
  },
  {
    id: "INV-005",
    name: "Furniture Handles",
    category: "Hardware",
    quantity: 250,
    unit: "Pieces",
    minStock: 50,
    status: "In Stock",
  },
];

export default function Inventory() {
  const [inventory, setInventory] = useState(initialInventory);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [showAddForm, setShowAddForm] = useState(false);

  const [newItem, setNewItem] = useState({
    name: "",
    category: "Raw Material",
    quantity: "",
    unit: "Units",
    minStock: "",
  });

  const filteredInventory = useMemo(() => {
    return inventory.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.id.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        category === "All" || item.category === category;

      return matchesSearch && matchesCategory;
    });
  }, [inventory, search, category]);

  const totalItems = inventory.length;

  const rawMaterials = inventory.filter(
    (item) => item.category === "Raw Material"
  ).length;

  const finishedGoods = inventory.filter(
    (item) => item.category === "Finished Goods"
  ).length;

  const lowStockItems = inventory.filter(
    (item) => item.quantity <= item.minStock
  ).length;

  const handleAddItem = (e) => {
    e.preventDefault();

    if (!newItem.name || !newItem.quantity || !newItem.minStock) {
      alert("Please fill all required fields");
      return;
    }

    const quantity = Number(newItem.quantity);
    const minStock = Number(newItem.minStock);

    const item = {
      id: `INV-${String(inventory.length + 1).padStart(3, "0")}`,
      name: newItem.name,
      category: newItem.category,
      quantity,
      unit: newItem.unit,
      minStock,
      status: quantity <= minStock ? "Low Stock" : "In Stock",
    };

    setInventory([...inventory, item]);

    setNewItem({
      name: "",
      category: "Raw Material",
      quantity: "",
      unit: "Units",
      minStock: "",
    });

    setShowAddForm(false);
  };

  const statCards = [
    {
      title: "Total Items",
      value: totalItems,
      icon: Package,
      description: "Items in inventory",
    },
    {
      title: "Raw Materials",
      value: rawMaterials,
      icon: Boxes,
      description: "Materials available",
    },
    {
      title: "Finished Goods",
      value: finishedGoods,
      icon: Warehouse,
      description: "Ready products",
    },
    {
      title: "Low Stock",
      value: lowStockItems,
      icon: AlertTriangle,
      description: "Items need attention",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div
        style={{
          marginBottom: 28,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 20,
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1
            style={{
              color: "#17241d",
              fontSize: 30,
              fontWeight: 700,
              margin: 0,
              fontFamily: "monospace",
            }}
          >
            <TextShuffle text="Inventory" duration={900} />
          </h1>

          <p
            style={{
              color: "#9da49f",
              marginTop: 6,
              fontSize: 13,
            }}
          >
            <WordMorph
              text="Manage your stock, raw materials, and finished goods."
              stagger={0.07}
              delay={0.15}
            />
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          style={{
            background: "#405b4d",
            color: "#fff",
            border: "none",
            borderRadius: 12,
            padding: "12px 18px",
            display: "flex",
            alignItems: "center",
            gap: 8,
            cursor: "pointer",
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          <Plus size={17} />
          Add Inventory
        </button>
      </div>

      {/* Statistics */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
          gap: 18,
          marginBottom: 24,
        }}
      >
        {statCards.map((stat, index) => {
          const Icon = stat.icon;

          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              style={{
                ...card,
                padding: 22,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <div>
                  <p
                    style={{
                      color: "#9da49f",
                      fontSize: 12,
                      margin: 0,
                      fontWeight: 500,
                    }}
                  >
                    {stat.title}
                  </p>

                  <h2
                    style={{
                      color: "#17241d",
                      fontSize: 28,
                      margin: "8px 0 4px",
                      fontWeight: 700,
                    }}
                  >
                    {stat.value}
                  </h2>

                  <p
                    style={{
                      color: "#6b7c71",
                      fontSize: 11,
                      margin: 0,
                    }}
                  >
                    {stat.description}
                  </p>
                </div>

                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 13,
                    background: "#e8eee9",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon size={20} color="#405b4d" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Add Inventory Form */}
      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          style={{
            ...card,
            padding: 24,
            marginBottom: 24,
          }}
        >
          <h3
            style={{
              color: "#17241d",
              marginTop: 0,
              marginBottom: 20,
              fontSize: 17,
            }}
          >
            Add New Inventory Item
          </h3>

          <form onSubmit={handleAddItem}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(180px, 1fr))",
                gap: 14,
              }}
            >
              <input
                placeholder="Item name"
                value={newItem.name}
                onChange={(e) =>
                  setNewItem({
                    ...newItem,
                    name: e.target.value,
                  })
                }
                style={inputStyle}
              />

              <select
                value={newItem.category}
                onChange={(e) =>
                  setNewItem({
                    ...newItem,
                    category: e.target.value,
                  })
                }
                style={inputStyle}
              >
                <option>Raw Material</option>
                <option>Finished Goods</option>
                <option>Hardware</option>
              </select>

              <input
                type="number"
                placeholder="Quantity"
                value={newItem.quantity}
                onChange={(e) =>
                  setNewItem({
                    ...newItem,
                    quantity: e.target.value,
                  })
                }
                style={inputStyle}
              />

              <select
                value={newItem.unit}
                onChange={(e) =>
                  setNewItem({
                    ...newItem,
                    unit: e.target.value,
                  })
                }
                style={inputStyle}
              >
                <option>Units</option>
                <option>Pieces</option>
                <option>Sheets</option>
                <option>Kg</option>
              </select>

              <input
                type="number"
                placeholder="Minimum stock"
                value={newItem.minStock}
                onChange={(e) =>
                  setNewItem({
                    ...newItem,
                    minStock: e.target.value,
                  })
                }
                style={inputStyle}
              />
            </div>

            <div
              style={{
                display: "flex",
                gap: 10,
                marginTop: 18,
              }}
            >
              <button
                type="submit"
                style={{
                  background: "#405b4d",
                  color: "#fff",
                  border: "none",
                  borderRadius: 10,
                  padding: "10px 18px",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                Add Item
              </button>

              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                style={{
                  background: "#e8eee9",
                  color: "#405b4d",
                  border: "none",
                  borderRadius: 10,
                  padding: "10px 18px",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Inventory Table */}
      <div
        style={{
          ...card,
          overflow: "hidden",
        }}
      >
        {/* Table Header */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid #d4ddd6",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <div>
            <h3
              style={{
                color: "#17241d",
                margin: 0,
                fontSize: 17,
              }}
            >
              Inventory Overview
            </h3>

            <p
              style={{
                color: "#9da49f",
                fontSize: 12,
                margin: "5px 0 0",
              }}
            >
              {filteredInventory.length} items displayed
            </p>
          </div>

          <div
            style={{
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                position: "relative",
              }}
            >
              <Search
                size={16}
                color="#9da49f"
                style={{
                  position: "absolute",
                  left: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                }}
              />

              <input
                placeholder="Search inventory..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  ...inputStyle,
                  paddingLeft: 36,
                  width: 200,
                }}
              />
            </div>

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{
                ...inputStyle,
                width: 150,
              }}
            >
              <option value="All">All Categories</option>
              <option value="Raw Material">Raw Materials</option>
              <option value="Finished Goods">Finished Goods</option>
              <option value="Hardware">Hardware</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              minWidth: 850,
            }}
          >
            <thead>
              <tr
                style={{
                  background: "#f7f9f7",
                }}
              >
                {[
                  "Item",
                  "Category",
                  "Available Stock",
                  "Minimum Stock",
                  "Status",
                  "Actions",
                ].map((heading) => (
                  <th
                    key={heading}
                    style={{
                      textAlign: "left",
                      padding: "14px 24px",
                      color: "#6b7c71",
                      fontSize: 11,
                      fontWeight: 600,
                    }}
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {filteredInventory.map((item) => {
                const isLowStock =
                  item.quantity <= item.minStock;

                return (
                  <tr
                    key={item.id}
                    style={{
                      borderTop: "1px solid #edf0ee",
                    }}
                  >
                    <td
                      style={{
                        padding: "17px 24px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                        }}
                      >
                        <div
                          style={{
                            width: 38,
                            height: 38,
                            borderRadius: 11,
                            background: "#e8eee9",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Package
                            size={18}
                            color="#405b4d"
                          />
                        </div>

                        <div>
                          <p
                            style={{
                              margin: 0,
                              color: "#17241d",
                              fontSize: 13,
                              fontWeight: 600,
                            }}
                          >
                            {item.name}
                          </p>

                          <span
                            style={{
                              color: "#9da49f",
                              fontSize: 11,
                            }}
                          >
                            {item.id}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td
                      style={{
                        padding: "17px 24px",
                        color: "#6b7c71",
                        fontSize: 12,
                      }}
                    >
                      {item.category}
                    </td>

                    <td
                      style={{
                        padding: "17px 24px",
                        color: "#17241d",
                        fontSize: 13,
                        fontWeight: 600,
                      }}
                    >
                      {item.quantity}{" "}
                      <span
                        style={{
                          color: "#9da49f",
                          fontSize: 11,
                          fontWeight: 400,
                        }}
                      >
                        {item.unit}
                      </span>
                    </td>

                    <td
                      style={{
                        padding: "17px 24px",
                        color: "#6b7c71",
                        fontSize: 12,
                      }}
                    >
                      {item.minStock} {item.unit}
                    </td>

                    <td
                      style={{
                        padding: "17px 24px",
                      }}
                    >
                      <div
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          padding: "6px 10px",
                          borderRadius: 20,
                          background: isLowStock
                            ? "#f5eee6"
                            : "#e8eee9",
                          color: isLowStock
                            ? "#8a6747"
                            : "#405b4d",
                          fontSize: 11,
                          fontWeight: 600,
                        }}
                      >
                        {isLowStock ? (
                          <AlertTriangle size={13} />
                        ) : (
                          <CheckCircle2 size={13} />
                        )}

                        {isLowStock
                          ? "Low Stock"
                          : "In Stock"}
                      </div>
                    </td>

                    <td
                      style={{
                        padding: "17px 24px",
                      }}
                    >
                      <button
                        style={{
                          border: "none",
                          background: "transparent",
                          color: "#6b7c71",
                          cursor: "pointer",
                          padding: 5,
                        }}
                      >
                        <MoreHorizontal size={19} />
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filteredInventory.length === 0 && (
                <tr>
                  <td
                    colSpan="6"
                    style={{
                      textAlign: "center",
                      padding: 50,
                      color: "#9da49f",
                      fontSize: 13,
                    }}
                  >
                    <Package
                      size={30}
                      color="#9da49f"
                      style={{ marginBottom: 10 }}
                    />

                    <div>No inventory items found</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Summary */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 18,
          marginTop: 24,
        }}
      >
        <div
          style={{
            ...card,
            padding: 22,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 14,
            }}
          >
            <TrendingUp size={18} color="#405b4d" />

            <h3
              style={{
                margin: 0,
                color: "#17241d",
                fontSize: 14,
              }}
            >
              Stock Overview
            </h3>
          </div>

          <p
            style={{
              margin: 0,
              color: "#6b7c71",
              fontSize: 13,
              lineHeight: 1.7,
            }}
          >
            Your inventory currently contains{" "}
            <strong style={{ color: "#17241d" }}>
              {totalItems} items
            </strong>
            , with{" "}
            <strong style={{ color: "#17241d" }}>
              {lowStockItems} items
            </strong>{" "}
            requiring stock attention.
          </p>
        </div>

        <div
          style={{
            ...card,
            padding: 22,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 14,
            }}
          >
            <AlertTriangle size={18} color="#405b4d" />

            <h3
              style={{
                margin: 0,
                color: "#17241d",
                fontSize: 14,
              }}
            >
              Inventory Alerts
            </h3>
          </div>

          <p
            style={{
              margin: 0,
              color: "#6b7c71",
              fontSize: 13,
              lineHeight: 1.7,
            }}
          >
            Monitor low-stock materials to avoid production delays and maintain smooth furniture operations.
          </p>
        </div>
      </div>
    </motion.div>
  );
}

const inputStyle = {
  background: "#fff",
  border: "1px solid #d4ddd6",
  borderRadius: 10,
  padding: "10px 12px",
  color: "#17241d",
  fontSize: 12,
  outline: "none",
};
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  IconButton,
  Modal,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { DataGrid } from "@mui/x-data-grid";
import Layout from "../../components/layout/Layout";
import axios from "axios";

const Products = () => {
  const [error, setError] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [editProductId, setEditProductId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    categoryId: "",
  });
  const [image, setImage] = useState(null);

  // Fetch all products
  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await axios.get(
        "http://localhost:4000/api/product/getAllProducts",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setProducts(res.data || []);
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  // Fetch filtered products
  const filterProducts = async () => {
    try {
      const res = await axios.get(
        "http://localhost:4000/api/product/filterProduct",
        {
          params: { search, category: selectedCategory },
        }
      );
      setProducts(res.data || []);
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await axios.get(
        "http://localhost:4000/api/category/getAllCategories",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setCategories(res.data || []);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // Debounce search/filter for better performance
  useEffect(() => {}, [search, selectedCategory]);

  // Delete product
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this product?"
    );
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("adminToken");
      await axios.delete(
        `http://localhost:4000/api/product/deleteProduct/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchProducts();
    } catch (err) {
      console.error("Error deleting product:", err);
    }
  };

  // Edit product
  const handleEdit = (product) => {
    setEditMode(true);
    setEditProductId(product._id);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      categoryId: product.categoryId?._id || "",
    });
    setImage(null);
    setOpenModal(true);
  };

  // Submit add/update product
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("adminToken");
      const data = new FormData();
      data.append("name", formData.name);
      data.append("description", formData.description);
      data.append("price", formData.price);
      data.append("categoryId", formData.categoryId);
      if (image) data.append("image", image);

      if (editMode && editProductId) {
        await axios.patch(
          `http://localhost:4000/api/product/updateProduct/${editProductId}`,
          data,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post("http://localhost:4000/api/product/addProduct", data, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      handleCloseModal();
      fetchProducts();
    } catch (err) {
      console.error("Failed to submit product", err);
      setError(err.response?.data?.message || "Something went wrong");
    }
  };

  // Close modal and reset form
  const handleCloseModal = () => {
    setOpenModal(false);
    setFormData({ name: "", description: "", price: "", categoryId: "" });
    setImage(null);
    setEditMode(false);
    setEditProductId(null);
    setError("");
  };

  const columns = [
    { field: "name", headerName: "Product Name", width: 200 },
    {
      field: "categoryId",
      headerName: "Category",
      width: 150,
      renderCell: (params) => params.row.categoryId?.name || "N/A",
    },
    { field: "price", headerName: "Price", width: 100 },
    {
      field: "image",
      headerName: "Image",
      width: 120,
      renderCell: (params) =>
        params.value ? (
          <img
            src={`http://localhost:4000/uploads/${params.value}`}
            alt="product"
            style={{ width: 50, height: 50, objectFit: "cover" }}
          />
        ) : (
          "No Image"
        ),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 120,
      renderCell: (params) => (
        <Box>
          <IconButton onClick={() => handleEdit(params.row)}>
            <EditIcon />
          </IconButton>
          <IconButton onClick={() => handleDelete(params.row._id)}>
            <DeleteIcon />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Layout>
      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 10 }}>
        <Typography variant="h4">Products</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setFormData({
              name: "",
              description: "",
              price: "",
              categoryId: "",
            });
            setImage(null);
            setEditMode(false);
            setOpenModal(true);
          }}>
          Add Product
        </Button>
      </Box>

      <Paper sx={{ p: 2, m: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <TextField
            placeholder="Search products..."
            variant="outlined"
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ flexGrow: 1 }}
            InputProps={{
              startAdornment: (
                <SearchIcon sx={{ mr: 1, color: "action.active" }} />
              ),
            }}
          />
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <Select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              displayEmpty>
              <MenuItem value="">All Categories</MenuItem>
              {categories.map((cat) => (
                <MenuItem key={cat._id} value={cat._id}>
                  {cat.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button variant="outlined" onClick={filterProducts}>
            Filter
          </Button>
        </Box>
      </Paper>

      <Paper sx={{ height: 500, width: "100%" }}>
        <DataGrid
          rows={products}
          columns={columns}
          getRowId={(row) => row._id}
          pageSize={5}
          rowsPerPageOptions={[5, 10, 20]}
          checkboxSelection
          disableSelectionOnClick
          sx={{ "& .MuiDataGrid-cell": { alignItems: "center" } }}
        />
      </Paper>

      {/* Add/Edit Product Modal */}
      <Modal open={openModal} onClose={handleCloseModal}>
        <Paper
          sx={{
            width: 500,
            p: 4,
            mx: "auto",
            mt: 10,
            position: "relative",
            maxHeight: "80vh",
            overflowY: "auto",
          }}>
          <IconButton
            onClick={handleCloseModal}
            sx={{ position: "absolute", top: 8, right: 8 }}>
            <CloseIcon />
          </IconButton>

          <Typography variant="h6" mb={2}>
            {editMode ? "Edit Product" : "Add New Product"}
          </Typography>

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Price"
              type="number"
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: e.target.value })
              }
              margin="normal"
              required
            />
            <FormControl fullWidth margin="normal" required>
              <InputLabel>Category</InputLabel>
              <Select
                value={formData.categoryId}
                onChange={(e) =>
                  setFormData({ ...formData, categoryId: e.target.value })
                }
                label="Category">
                {categories.map((cat) => (
                  <MenuItem key={cat._id} value={cat._id}>
                    {cat.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button variant="outlined" component="label" sx={{ mt: 2 }}>
              Upload Image
              <input
                type="file"
                hidden
                onChange={(e) => setImage(e.target.files[0])}
              />
            </Button>

            <Box mt={3}>
              <Button type="submit" variant="contained" fullWidth>
                Submit
              </Button>
            </Box>
          </form>
          {error && (
            <Typography color="error" mt={2}>
              {error}
            </Typography>
          )}
        </Paper>
      </Modal>
    </Layout>
  );
};

export default Products;

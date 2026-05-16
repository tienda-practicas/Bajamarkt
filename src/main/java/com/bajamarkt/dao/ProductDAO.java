package com.bajamarkt.dao;

import com.bajamarkt.models.Product;
import com.bajamarkt.utils.DatabaseConnection;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class ProductDAO {

    public List<Product> getAllProducts() {
        // Reuses searchProducts with no filters
        return searchProducts(null, null, null, null, null);
    }

    /**
     * Search products with optional filters. Any null parameter is ignored.
     *
     * @param search      text to match against product name (LIKE %x%)
     * @param idCategory  filter by exact category id
     * @param priceMin    minimum price (inclusive)
     * @param priceMax    maximum price (inclusive)
     * @param stockLevel  "low" (1..10), "out" (=0), "ok" (>10), or null/"all"
     */
    public List<Product> searchProducts(String search, Integer idCategory,
                                        Double priceMin, Double priceMax,
                                        String stockLevel) {
        List<Product> products = new ArrayList<>();

        // Start with the base query. We append WHERE clauses dynamically.
        StringBuilder sql = new StringBuilder("SELECT * FROM product WHERE 1=1");
        List<Object> params = new ArrayList<>();

        if (search != null && !search.isBlank()) {
            sql.append(" AND LOWER(name) LIKE ?");
            params.add("%" + search.toLowerCase() + "%");
        }
        if (idCategory != null) {
            sql.append(" AND id_category = ?");
            params.add(idCategory);
        }
        if (priceMin != null) {
            sql.append(" AND price >= ?");
            params.add(priceMin);
        }
        if (priceMax != null) {
            sql.append(" AND price <= ?");
            params.add(priceMax);
        }
        if (stockLevel != null) {
            switch (stockLevel) {
                case "low": sql.append(" AND stock <= 10 AND stock > 0"); break;
                case "out": sql.append(" AND stock = 0"); break;
                case "ok":  sql.append(" AND stock > 10"); break;
                // "all" or anything else: no extra clause
            }
        }

        sql.append(" ORDER BY id");

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql.toString())) {

            // Bind parameters in the same order we appended them
            for (int i = 0; i < params.size(); i++) {
                stmt.setObject(i + 1, params.get(i));
            }

            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    products.add(mapRow(rs));
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return products;
    }

    public Product getProductById(int id) {
        String sql = "SELECT * FROM product WHERE id = ?";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setInt(1, id);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return mapRow(rs);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }

    public boolean addProduct(Product product) {
        String sql = "INSERT INTO product (name, price, stock, image, id_category) VALUES (?, ?, ?, ?, ?)";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, product.getName());
            stmt.setDouble(2, product.getPrice());
            stmt.setInt(3, product.getStock());
            stmt.setString(4, product.getImage());
            stmt.setInt(5, product.getIdCategory());

            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    public boolean updateProduct(Product product) {
        String sql = "UPDATE product SET name = ?, price = ?, stock = ?, image = ?, id_category = ? WHERE id = ?";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, product.getName());
            stmt.setDouble(2, product.getPrice());
            stmt.setInt(3, product.getStock());
            stmt.setString(4, product.getImage());
            stmt.setInt(5, product.getIdCategory());
            stmt.setInt(6, product.getId());

            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    public boolean deleteProduct(int id) {
        String sql = "DELETE FROM product WHERE id = ?";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setInt(1, id);
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    // Helper: builds a Product from the current ResultSet row
    private Product mapRow(ResultSet rs) throws SQLException {
        return new Product(
                rs.getInt("id"),
                rs.getString("name"),
                rs.getDouble("price"),
                rs.getInt("stock"),
                rs.getString("image"),
                rs.getInt("id_category")
        );
    }
}
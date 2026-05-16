package com.bajamarkt.dao;

import com.bajamarkt.models.Product;
import com.bajamarkt.utils.DatabaseConnection;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class ProductDAO {

    public List<Product> getAllProducts() {
        return searchProducts(null, null, null, null, null);
    }

    /**
     * Search products with optional filters.
     */
    public List<Product> searchProducts(String search, Integer idCategory,
                                        Double priceMin, Double priceMax,
                                        String stockLevel) {

        List<Product> products = new ArrayList<>();

        StringBuilder sql = new StringBuilder("""
            SELECT
                p.id,
                p.name,
                p.price,
                p.stock,
                p.image,
                p.id_category,
                c.name AS categoryName
            FROM product p
            JOIN category c
            ON p.id_category = c.id
            WHERE 1=1
        """);

        List<Object> params = new ArrayList<>();

        if (search != null && !search.isBlank()) {
            sql.append(" AND LOWER(p.name) LIKE ?");
            params.add("%" + search.toLowerCase() + "%");
        }

        if (idCategory != null) {
            sql.append(" AND p.id_category = ?");
            params.add(idCategory);
        }

        if (priceMin != null) {
            sql.append(" AND p.price >= ?");
            params.add(priceMin);
        }

        if (priceMax != null) {
            sql.append(" AND p.price <= ?");
            params.add(priceMax);
        }

        if (stockLevel != null) {
            switch (stockLevel) {
                case "low":
                    sql.append(" AND p.stock <= 10 AND p.stock > 0");
                    break;

                case "out":
                    sql.append(" AND p.stock = 0");
                    break;

                case "ok":
                    sql.append(" AND p.stock > 10");
                    break;
            }
        }

        sql.append(" ORDER BY p.id");

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql.toString())) {

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

        String sql = """
            SELECT
                p.id,
                p.name,
                p.price,
                p.stock,
                p.image,
                p.id_category,
                c.name AS categoryName
            FROM product p
            JOIN category c
            ON p.id_category = c.id
            WHERE p.id = ?
        """;

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

        String sql = """
            INSERT INTO product
            (name, price, stock, image, id_category)
            VALUES (?, ?, ?, ?, ?)
        """;

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

        String sql = """
            UPDATE product
            SET name = ?, price = ?, stock = ?, image = ?, id_category = ?
            WHERE id = ?
        """;

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

    /**
     * Helper: builds a Product from ResultSet
     */
    private Product mapRow(ResultSet rs) throws SQLException {

        Product product = new Product(
                rs.getInt("id"),
                rs.getString("name"),
                rs.getDouble("price"),
                rs.getInt("stock"),
                rs.getString("image"),
                rs.getInt("id_category")
        );

        product.setCategoryName(rs.getString("categoryName"));

        return product;
    }
}
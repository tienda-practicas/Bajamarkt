package com.bajamarkt.dao;

import com.bajamarkt.models.Category;
import com.bajamarkt.utils.DatabaseConnection;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class CategoryDAO {

    public List<Category> getAllCategories() {
        return searchCategories(null, null);
    }

    /**
     * Search categories with optional filters.
     *
     * @param search     text to match against name or description (null = no filter)
     * @param activeOnly true = active only, false = inactive only, null = both
     */
    public List<Category> searchCategories(String search, Boolean activeOnly) {
        List<Category> categories = new ArrayList<>();

        StringBuilder sql = new StringBuilder("SELECT * FROM category WHERE 1=1");
        List<Object> params = new ArrayList<>();

        if (search != null && !search.isBlank()) {
            sql.append(" AND (LOWER(name) LIKE ? OR LOWER(description) LIKE ?)");
            String pattern = "%" + search.toLowerCase() + "%";
            params.add(pattern);
            params.add(pattern);
        }
        if (activeOnly != null) {
            sql.append(" AND active = ?");
            params.add(activeOnly);
        }

        sql.append(" ORDER BY id");

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql.toString())) {

            for (int i = 0; i < params.size(); i++) {
                stmt.setObject(i + 1, params.get(i));
            }

            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    categories.add(mapRow(rs));
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return categories;
    }

    public Category getCategoryById(int id) {
        String sql = "SELECT * FROM category WHERE id = ?";
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

    public boolean addCategory(Category category) {
        // created_at is NOT in the INSERT: the database fills it via DEFAULT CURRENT_TIMESTAMP
        String sql = "INSERT INTO category (name, description, active) VALUES (?, ?, ?)";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, category.getName());
            stmt.setString(2, category.getDescription());
            stmt.setBoolean(3, category.isActive());

            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    public boolean updateCategory(Category category) {
        // created_at is never updated — it's the original creation timestamp
        String sql = "UPDATE category SET name = ?, description = ?, active = ? WHERE id = ?";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, category.getName());
            stmt.setString(2, category.getDescription());
            stmt.setBoolean(3, category.isActive());
            stmt.setInt(4, category.getId());

            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    public boolean deleteCategory(int id) {
        String sql = "DELETE FROM category WHERE id = ?";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setInt(1, id);
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    // Helper: builds a Category from the current ResultSet row
    private Category mapRow(ResultSet rs) throws SQLException {
        return new Category(
                rs.getInt("id"),
                rs.getString("name"),
                rs.getString("description"),
                rs.getBoolean("active"),
                rs.getTimestamp("created_at")
        );
    }
}
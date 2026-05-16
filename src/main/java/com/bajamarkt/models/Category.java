package com.bajamarkt.models;

import java.sql.Timestamp;

public class Category {
    private int id;
    private String name;
    private String description;
    private boolean active;
    private Timestamp createdAt; // Read-only: set by the database via DEFAULT CURRENT_TIMESTAMP

    public Category() {}

    // Constructor used when inserting/updating (no createdAt yet)
    public Category(int id, String name, String description, boolean active) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.active = active;
    }

    // Constructor used when reading from the database (includes createdAt)
    public Category(int id, String name, String description, boolean active, Timestamp createdAt) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.active = active;
        this.createdAt = createdAt;
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }

    public Timestamp getCreatedAt() { return createdAt; }
    public void setCreatedAt(Timestamp createdAt) { this.createdAt = createdAt; }
}
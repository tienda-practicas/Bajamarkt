package com.bajamarkt.models;

public class Category {
    private int id;
    private String name;
    private String description;
    private String brand;
    private boolean active;

    public Category() {}

    public Category(int id, String name, String description, String brand, boolean active) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.brand = brand;
        this.active = active;
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getBrand() { return brand; }
    public void setBrand(String brand) { this.brand = brand; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
}
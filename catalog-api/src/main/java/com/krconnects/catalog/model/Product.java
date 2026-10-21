package com.krconnects.catalog.model;

import java.math.BigDecimal;

/**
 * A product, as returned by the Data API (GET http://data-api:8080/products)
 * and passed on to the customer portal.
 */
public class Product {

    private int id;
    private String name;
    private String category;
    private BigDecimal price;

    public Product() {
    }

    public Product(int id, String name, String category, BigDecimal price) {
        this.id = id;
        this.name = name;
        this.category = category;
        this.price = price;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }
}

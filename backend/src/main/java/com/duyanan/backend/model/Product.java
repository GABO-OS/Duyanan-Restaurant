package com.duyanan.backend.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Data;

@Entity
@Data
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private Double priceSolo;
    private Double priceALaCarte;
    private Double price1Liter;
    private Double price1Point5Liter;
    private Double price2Liter;
    private String description;
    private String imageUrl;
    private String category;
    private String flavors;
}

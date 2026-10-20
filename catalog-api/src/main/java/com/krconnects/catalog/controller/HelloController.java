package com.krconnects.catalog.controller;

import com.krconnects.catalog.model.HelloResponse;
import com.krconnects.catalog.service.CatalogInfoService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HelloController {

    private final CatalogInfoService catalogInfoService;

    public HelloController(CatalogInfoService catalogInfoService) {
        this.catalogInfoService = catalogInfoService;
    }

    // GET / - simple root identifier so hitting the base URL immediately
    // shows which app this is, without needing to know a specific route.
    @GetMapping("/")
    public HelloResponse root() {
        return catalogInfoService.getHello();
    }

    // GET /hello - identifies this service and proves the frontend-to-API
    // call works.
    @GetMapping("/hello")
    public HelloResponse hello() {
        return catalogInfoService.getHello();
    }

    // GET /products - dummy but meaningful product data, standing in for
    // a real Cosmos DB-backed catalog query.
    @GetMapping("/products")
    public HelloResponse products() {
        return catalogInfoService.getProducts();
    }
}

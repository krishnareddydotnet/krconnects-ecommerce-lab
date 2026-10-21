package com.krconnects.catalog.service;

import com.krconnects.catalog.model.HelloResponse;
import com.krconnects.catalog.model.Product;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

/**
 * Contains the response-building logic for Catalog API's identity and
 * product endpoints. Kept separate from the controller so the controller
 * stays a thin HTTP layer.
 *
 * Products now come from the Data API (SQL Server), not a hardcoded list.
 */
@Service
public class CatalogInfoService {

    private static final String SERVICE_NAME = "krconnects-catalog-api";

    private final DataApiClient dataApiClient;

    public CatalogInfoService(DataApiClient dataApiClient) {
        this.dataApiClient = dataApiClient;
    }

    public HelloResponse getHello() {
        return new HelloResponse(
                "This is the KRConnects Catalog API — responsible for product catalog data.",
                SERVICE_NAME,
                Instant.now().toString(),
                null
        );
    }

    // Asks the Data API for the products and wraps them in the same response
    // shape the customer portal already expects: { message, service, timestamp, products }
    public HelloResponse getProducts() {
        List<Product> products = dataApiClient.getProducts();

        return new HelloResponse(
                "KRConnects Catalog API — product catalog data from the Data API.",
                SERVICE_NAME,
                Instant.now().toString(),
                products
        );
    }
}

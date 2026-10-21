package com.krconnects.catalog.service;

import com.krconnects.catalog.model.Product;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.time.Duration;
import java.util.List;

/**
 * Calls the Data API over HTTP.
 *
 * The Data API is the ONLY service that talks to SQL Server, so catalog-api
 * gets its products from here instead of a hardcoded list.
 *
 * The Data API address comes from application.yml (krconnects.data-api.url),
 * which reads the DATA_API_URL environment variable and falls back to
 * http://data-api:8080 (the Kubernetes Service name, resolved by CoreDNS).
 */
@Component
public class DataApiClient {

    private final RestClient restClient;

    public DataApiClient(@Value("${krconnects.data-api.url}") String dataApiUrl) {
        // Don't wait forever if the Data API is slow or down
        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(Duration.ofSeconds(3));
        requestFactory.setReadTimeout(Duration.ofSeconds(5));

        this.restClient = RestClient.builder()
                .baseUrl(dataApiUrl)
                .requestFactory(requestFactory)
                .build();
    }

    /**
     * GET {dataApiUrl}/products  ->  list of products from the database.
     * Throws a RestClientException if the Data API can't be reached or returns an error.
     */
    public List<Product> getProducts() {
        return restClient.get()
                .uri("/products")
                .retrieve()
                .body(new ParameterizedTypeReference<List<Product>>() {});
    }
}

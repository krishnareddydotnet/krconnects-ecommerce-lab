package com.krconnects.catalog.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class HelloControllerTests {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void root_returnsOk() throws Exception {
        mockMvc.perform(get("/"))
                .andExpect(status().isOk());
    }

    @Test
    void root_containsServiceName() throws Exception {
        mockMvc.perform(get("/"))
                .andExpect(content().string(org.hamcrest.Matchers.containsString("krconnects-catalog-api")));
    }

    @Test
    void hello_returnsOk() throws Exception {
        mockMvc.perform(get("/hello"))
                .andExpect(status().isOk());
    }

    @Test
    void hello_containsTimestamp() throws Exception {
        mockMvc.perform(get("/hello"))
                .andExpect(content().string(org.hamcrest.Matchers.containsString("timestamp")));
    }

    @Test
    void products_returnsOk() throws Exception {
        mockMvc.perform(get("/products"))
                .andExpect(status().isOk());
    }

    @Test
    void products_containsSampleProduct() throws Exception {
        mockMvc.perform(get("/products"))
                .andExpect(content().string(org.hamcrest.Matchers.containsString("Wireless Mouse")));
    }
}

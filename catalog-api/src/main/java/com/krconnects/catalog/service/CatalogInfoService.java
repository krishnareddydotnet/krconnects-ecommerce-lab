package com.krconnects.catalog.service;

import com.krconnects.catalog.model.HelloResponse;
import com.krconnects.catalog.model.Product;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

/**
 * Contains the response-building logic for Catalog API's identity and
 * product endpoints. Kept separate from the controller so the controller
 * stays a thin HTTP layer, consistent with KRConnects' convention of
 * separating business logic from request handling.
 */
@Service
public class CatalogInfoService {

    private static final String SERVICE_NAME = "krconnects-catalog-api";

    public HelloResponse getHello() {
        return new HelloResponse(
                "This is the KRConnects Catalog API — responsible for product catalog data.",
                SERVICE_NAME,
                Instant.now().toString(),
                null
        );
    }

    public HelloResponse getProducts() {
        // 100 dummy products for demo (10 categories).
        // In production these would come from a database (Cosmos DB).
        List<Product> dummyProducts = List.of(
                new Product(1, "Wireless Mouse", "Electronics"),
                new Product(2, "Standing Desk", "Furniture"),
                new Product(3, "Noise Cancelling Headphones", "Electronics"),
                new Product(4, "Mechanical Keyboard", "Electronics"),
                new Product(5, "Ergonomic Office Chair", "Furniture"),
                new Product(6, "Clean Code", "Books"),
                new Product(7, "Cotton T-Shirt", "Clothing"),
                new Product(8, "Yoga Mat", "Sports"),
                new Product(9, "Non-stick Frying Pan", "Kitchen"),
                new Product(10, "Building Blocks", "Toys"),
                new Product(11, "Face Wash", "Beauty"),
                new Product(12, "Garden Hose", "Garden"),
                new Product(13, "Notebook A5", "Office"),
                new Product(14, "USB-C Hub", "Electronics"),
                new Product(15, "Bookshelf", "Furniture"),
                new Product(16, "The Pragmatic Programmer", "Books"),
                new Product(17, "Denim Jeans", "Clothing"),
                new Product(18, "Cricket Bat", "Sports"),
                new Product(19, "Pressure Cooker", "Kitchen"),
                new Product(20, "Remote Control Car", "Toys"),
                new Product(21, "Sunscreen SPF 50", "Beauty"),
                new Product(22, "Plant Pots Set", "Garden"),
                new Product(23, "Gel Pens Pack", "Office"),
                new Product(24, "27-inch Monitor", "Electronics"),
                new Product(25, "Coffee Table", "Furniture"),
                new Product(26, "Designing Data-Intensive Applications", "Books"),
                new Product(27, "Hooded Sweatshirt", "Clothing"),
                new Product(28, "Football", "Sports"),
                new Product(29, "Electric Kettle", "Kitchen"),
                new Product(30, "Jigsaw Puzzle", "Toys"),
                new Product(31, "Moisturizer", "Beauty"),
                new Product(32, "Pruning Shears", "Garden"),
                new Product(33, "Desk Organizer", "Office"),
                new Product(34, "Bluetooth Speaker", "Electronics"),
                new Product(35, "Sofa Bed", "Furniture"),
                new Product(36, "Kubernetes Up and Running", "Books"),
                new Product(37, "Formal Shirt", "Clothing"),
                new Product(38, "Badminton Racket", "Sports"),
                new Product(39, "Mixer Grinder", "Kitchen"),
                new Product(40, "Board Game", "Toys"),
                new Product(41, "Shampoo", "Beauty"),
                new Product(42, "Watering Can", "Garden"),
                new Product(43, "Stapler", "Office"),
                new Product(44, "Webcam HD 1080p", "Electronics"),
                new Product(45, "Dining Table", "Furniture"),
                new Product(46, "The Phoenix Project", "Books"),
                new Product(47, "Running Shorts", "Clothing"),
                new Product(48, "Dumbbell Set", "Sports"),
                new Product(49, "Chef Knife", "Kitchen"),
                new Product(50, "Soft Teddy Bear", "Toys"),
                new Product(51, "Hair Dryer", "Beauty"),
                new Product(52, "Lawn Mower", "Garden"),
                new Product(53, "Whiteboard", "Office"),
                new Product(54, "Portable SSD 1TB", "Electronics"),
                new Product(55, "Bedside Table", "Furniture"),
                new Product(56, "Site Reliability Engineering", "Books"),
                new Product(57, "Winter Jacket", "Clothing"),
                new Product(58, "Skipping Rope", "Sports"),
                new Product(59, "Cutting Board", "Kitchen"),
                new Product(60, "Rubik's Cube", "Toys"),
                new Product(61, "Beard Trimmer", "Beauty"),
                new Product(62, "Garden Gloves", "Garden"),
                new Product(63, "Sticky Notes", "Office"),
                new Product(64, "Smartwatch", "Electronics"),
                new Product(65, "Shoe Rack", "Furniture"),
                new Product(66, "Domain-Driven Design", "Books"),
                new Product(67, "Wool Sweater", "Clothing"),
                new Product(68, "Cycling Helmet", "Sports"),
                new Product(69, "Air Fryer", "Kitchen"),
                new Product(70, "Toy Train Set", "Toys"),
                new Product(71, "Lip Balm", "Beauty"),
                new Product(72, "Seed Starter Kit", "Garden"),
                new Product(73, "File Folders", "Office"),
                new Product(74, "Power Bank 20000mAh", "Electronics"),
                new Product(75, "TV Unit", "Furniture"),
                new Product(76, "Atomic Habits", "Books"),
                new Product(77, "Track Pants", "Clothing"),
                new Product(78, "Tennis Balls", "Sports"),
                new Product(79, "Coffee Maker", "Kitchen"),
                new Product(80, "Drawing Kit", "Toys"),
                new Product(81, "Perfume", "Beauty"),
                new Product(82, "Bird Feeder", "Garden"),
                new Product(83, "Desk Lamp", "Office"),
                new Product(84, "Wireless Earbuds", "Electronics"),
                new Product(85, "Wardrobe", "Furniture"),
                new Product(86, "Deep Work", "Books"),
                new Product(87, "Rain Coat", "Clothing"),
                new Product(88, "Resistance Bands", "Sports"),
                new Product(89, "Lunch Box", "Kitchen"),
                new Product(90, "Kite", "Toys"),
                new Product(91, "Body Lotion", "Beauty"),
                new Product(92, "Outdoor Lights", "Garden"),
                new Product(93, "Paper Shredder", "Office"),
                new Product(94, "Refactoring", "Books"),
                new Product(95, "Polo Shirt", "Clothing"),
                new Product(96, "Water Bottle", "Sports"),
                new Product(97, "Toaster", "Kitchen"),
                new Product(98, "Doll House", "Toys"),
                new Product(99, "Compost Bin", "Garden"),
                new Product(100, "Calculator", "Office")
        );

        return new HelloResponse(
                "KRConnects Catalog API — sample product catalog data.",
                SERVICE_NAME,
                Instant.now().toString(),
                dummyProducts
        );
    }
}
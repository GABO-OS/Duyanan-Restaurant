package com.duyanan.backend.controller;

import com.duyanan.backend.model.*;
import com.duyanan.backend.repository.*;
import com.duyanan.backend.util.*;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    public OrderController(OrderRepository orderRepository,
                           ProductRepository productRepository,
                           UserRepository userRepository,
                           JwtUtil jwtUtil) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
    }

    // ── Place a new order ────────────────────────────────────
    @PostMapping
    public ResponseEntity<?> createOrder(@RequestHeader("Authorization") String authHeader,
                                         @RequestBody Map<String, Object> body) {
        try {
            String token = authHeader.replace("Bearer ", "");
            var claims = jwtUtil.validateToken(token);
            String email = claims.getSubject();

            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Order order = new Order();
            order.setUser(user);
            order.setNotes((String) body.get("notes"));
            order.setOrderDate(LocalDateTime.now());
            order.setStatus("PENDING");

            String orderType = body.get("orderType") != null ? (String) body.get("orderType") : "PICKUP";
            order.setOrderType(orderType);
            
            if ("DELIVERY".equalsIgnoreCase(orderType)) {
                order.setDeliveryAddress((String) body.get("deliveryAddress"));
                Double fee = body.get("deliveryFee") != null ? Double.valueOf(body.get("deliveryFee").toString()) : 0.0;
                order.setDeliveryFee(fee);
            }

            // Parse items from request body
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> itemsData = (List<Map<String, Object>>) body.get("items");

            if (itemsData == null || itemsData.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Order must have at least one item."));
            }

            double totalAmount = 0;

            for (Map<String, Object> itemData : itemsData) {
                Long productId = Long.valueOf(itemData.get("productId").toString());
                Integer quantity = Integer.valueOf(itemData.get("quantity").toString());

                Product product = productRepository.findById(productId)
                        .orElseThrow(() -> new RuntimeException("Product not found: " + productId));

                String variant = itemData.get("variant") != null ? itemData.get("variant").toString() : null;
                
                Double unitPrice = 0.0;
                if ("A La Carte".equalsIgnoreCase(variant) && product.getPriceALaCarte() != null) {
                    unitPrice = product.getPriceALaCarte();
                } else if (product.getPriceSolo() != null) {
                    unitPrice = product.getPriceSolo();
                }

                OrderItem item = new OrderItem();
                item.setOrder(order);
                item.setProduct(product);
                item.setVariant(variant);
                item.setQuantity(quantity);
                item.setUnitPrice(unitPrice);
                item.setSubtotal(unitPrice * quantity);

                order.getItems().add(item);
                totalAmount += item.getSubtotal();
            }

            order.setTotalAmount(totalAmount + (order.getDeliveryFee() != null ? order.getDeliveryFee() : 0.0));
            Order saved = orderRepository.save(order);

            return ResponseEntity.ok(Map.of(
                    "message", "Order placed successfully!",
                    "orderId", saved.getId(),
                    "totalAmount", saved.getTotalAmount(),
                    "status", saved.getStatus()
            ));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ── Get current user's orders ────────────────────────────
    @GetMapping("/my-orders")
    public ResponseEntity<?> getMyOrders(@RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            var claims = jwtUtil.validateToken(token);
            String email = claims.getSubject();

            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            List<Order> orders = orderRepository.findByUserIdOrderByOrderDateDesc(user.getId());
            return ResponseEntity.ok(orders);

        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid token"));
        }
    }

    // ── Get order by ID ──────────────────────────────────────
    @GetMapping("/{id}")
    public ResponseEntity<?> getOrderById(@PathVariable Long id) {
        return orderRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}

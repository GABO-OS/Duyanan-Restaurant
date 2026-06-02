package com.duyanan.backend.controller;

import com.duyanan.backend.model.*;
import com.duyanan.backend.repository.*;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final ReservationRepository reservationRepository;

    public AdminController(UserRepository userRepository,
                           ProductRepository productRepository,
                           OrderRepository orderRepository,
                           ReservationRepository reservationRepository) {
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.orderRepository = orderRepository;
        this.reservationRepository = reservationRepository;
    }

    // ── Users ──────────────────────────────────────────────
    @GetMapping("/users")
    public List<Map<String, Object>> getAllUsers() {
        return userRepository.findAll().stream().map(u -> Map.<String, Object>of(
                "id", u.getId(),
                "firstName", u.getFirstName(),
                "lastName", u.getLastName(),
                "email", u.getEmail(),
                "role", u.getRole()
        )).toList();
    }

    // ── Products ──────────────────────────────────────────
    @GetMapping("/products")
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    @PostMapping("/products")
    public ResponseEntity<?> createProduct(@RequestBody Product product) {
        Product saved = productRepository.save(product);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/products/{id}")
    public ResponseEntity<?> updateProduct(@PathVariable Long id, @RequestBody Product product) {
        return productRepository.findById(id).map(existing -> {
            existing.setName(product.getName());
            existing.setPriceSolo(product.getPriceSolo());
            existing.setPriceALaCarte(product.getPriceALaCarte());
            existing.setPrice1Liter(product.getPrice1Liter());
            existing.setPrice1Point5Liter(product.getPrice1Point5Liter());
            existing.setPrice2Liter(product.getPrice2Liter());
            existing.setDescription(product.getDescription());
            existing.setImageUrl(product.getImageUrl());
            existing.setCategory(product.getCategory());
            existing.setFlavors(product.getFlavors());
            productRepository.save(existing);
            return ResponseEntity.ok(existing);
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/products/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id) {
        if (productRepository.existsById(id)) {
            productRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "Product deleted successfully."));
        }
        return ResponseEntity.notFound().build();
    }

    // ── Orders (Admin) ────────────────────────────────────
    @GetMapping("/orders")
    public List<Order> getAllOrders() {
        return orderRepository.findAllByOrderByOrderDateDesc();
    }

    @PutMapping("/orders/{id}/status")
    public ResponseEntity<?> updateOrderStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return orderRepository.findById(id).map(order -> {
            order.setStatus(body.get("status"));
            orderRepository.save(order);
            return ResponseEntity.ok(Map.of(
                    "message", "Order status updated.",
                    "orderId", order.getId(),
                    "status", order.getStatus()
            ));
        }).orElse(ResponseEntity.notFound().build());
    }

    // ── Reservations (Admin) ──────────────────────────────
    @GetMapping("/reservations")
    public List<Reservation> getAllReservations() {
        return reservationRepository.findAllByOrderByReservationDateDesc();
    }

    @PutMapping("/reservations/{id}/status")
    public ResponseEntity<?> updateReservationStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return reservationRepository.findById(id).map(reservation -> {
            reservation.setStatus(body.get("status"));
            reservationRepository.save(reservation);
            return ResponseEntity.ok(Map.of(
                    "message", "Reservation status updated.",
                    "reservationId", reservation.getId(),
                    "status", reservation.getStatus()
            ));
        }).orElse(ResponseEntity.notFound().build());
    }
}


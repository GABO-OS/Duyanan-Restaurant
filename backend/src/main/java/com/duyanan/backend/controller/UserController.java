package com.duyanan.backend.controller;

import com.duyanan.backend.model.*;
import com.duyanan.backend.repository.*;
import com.duyanan.backend.util.*;

import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.security.SecureRandom;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class UserController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public UserController(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    // ── Register ──────────────────────────────────────────
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String firstName = body.get("firstName");
        String lastName = body.get("lastName");

        // Validate names: letters, spaces, hyphens and apostrophes only
        String namePattern = "^[a-zA-ZÀ-ÖØ-öø-ÿ\\s'\\-]{2,}$";
        if (firstName == null || !firstName.trim().matches(namePattern)) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "First name must contain only letters (no numbers or special characters)."));
        }
        if (lastName == null || !lastName.trim().matches(namePattern)) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Last name must contain only letters (no numbers or special characters)."));
        }

        if (userRepository.existsByEmail(email)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email already in use."));
        }

        User user = new User();
        user.setFirstName(firstName.trim());
        user.setLastName(lastName.trim());
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(body.get("password"))); // BCrypt hash
        user.setRole("CUSTOMER");
        
        if (body.containsKey("phone")) {
            user.setPhone(body.get("phone"));
        }
        if (body.containsKey("address")) {
            user.setAddress(body.get("address"));
        }

        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "Registration successful!"));
    }

    // ── Login ─────────────────────────────────────────────
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String password = body.get("password");

        java.util.Optional<User> userOpt = userRepository.findByEmail(email);
        boolean success = userOpt.map(u -> passwordEncoder.matches(password, u.getPassword())).orElse(false);

        if (success) {
            User u = userOpt.get();
            String token = jwtUtil.generateToken(u.getId(), u.getEmail(), u.getRole());

            return ResponseEntity.ok(Map.of(
                    "message", "Login successful!",
                    "firstName", u.getFirstName(),
                    "lastName", u.getLastName(),
                    "email", u.getEmail(),
                    "role", u.getRole(),
                    "phone", u.getPhone() != null ? u.getPhone() : "",
                    "address", u.getAddress() != null ? u.getAddress() : "",
                    "token", token));
        }

        return ResponseEntity.status(401).body(Map.of(
                "error", "Invalid email or password."));
    }

    // ── Facebook Login ────────────────────────────────────
    @PostMapping("/facebook")
    public ResponseEntity<?> facebookLogin(@RequestBody Map<String, String> body) {
        String accessToken = body.get("accessToken");
        if (accessToken == null) return ResponseEntity.badRequest().body(Map.of("error", "Access token required"));

        try {
            // 1. Call Facebook Graph API to verify token and get user details
            String fbUrl = "https://graph.facebook.com/me?fields=id,first_name,last_name,email&access_token=" + accessToken;
            RestTemplate restTemplate = new RestTemplate();
            @SuppressWarnings("unchecked")
            Map<String, Object> fbData = restTemplate.getForObject(fbUrl, Map.class);

            if (fbData == null || fbData.get("id") == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Invalid Facebook token"));
            }

            // Extract values and ensure they are effectively final for the lambda
            String rawEmail = (String) fbData.get("email");
            if (rawEmail == null) {
                rawEmail = fbData.get("id") + "@facebook.com";
            }
            final String email = rawEmail;
            
            final String firstName = (String) fbData.get("first_name");
            final String lastName = (String) fbData.get("last_name");

            // 2. Find or create user
            User user = userRepository.findByEmail(email).orElseGet(() -> {
                User newUser = new User();
                newUser.setEmail(email);
                newUser.setFirstName(firstName != null ? firstName : "Facebook");
                newUser.setLastName(lastName != null ? lastName : "User");
                newUser.setRole("CUSTOMER");
                newUser.setPassword(passwordEncoder.encode("FB_AUTH_" + System.currentTimeMillis()));
                return userRepository.save(newUser);
            });

            // 3. Generate Token
            String token = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole());

            return ResponseEntity.ok(Map.of(
                    "message", "Facebook login successful!",
                    "firstName", user.getFirstName(),
                    "lastName", user.getLastName(),
                    "email", user.getEmail(),
                    "role", user.getRole(),
                    "phone", user.getPhone() != null ? user.getPhone() : "",
                    "address", user.getAddress() != null ? user.getAddress() : "",
                    "token", token));

        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Facebook authentication failed: " + e.getMessage()));
        }
    }

    // ── Current User ──────────────────────────────────────
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            var claims = jwtUtil.validateToken(token);
            String email = claims.getSubject();
            return userRepository.findByEmail(email)
                    .map(u -> ResponseEntity.ok(Map.of(
                            "firstName", u.getFirstName(),
                            "lastName", u.getLastName(),
                            "email", u.getEmail(),
                            "role", u.getRole(),
                            "phone", u.getPhone() != null ? u.getPhone() : "",
                            "address", u.getAddress() != null ? u.getAddress() : "")))
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid token"));
        }
    }

    // ── Update Current User ───────────────────────────────
    @PutMapping("/me")
    public ResponseEntity<?> updateCurrentUser(@RequestHeader("Authorization") String authHeader, @RequestBody Map<String, String> body) {
        try {
            String token = authHeader.replace("Bearer ", "");
            var claims = jwtUtil.validateToken(token);
            String email = claims.getSubject();
            
            return userRepository.findByEmail(email).map(user -> {
                if (body.containsKey("firstName")) user.setFirstName(body.get("firstName"));
                if (body.containsKey("lastName")) user.setLastName(body.get("lastName"));
                if (body.containsKey("phone")) user.setPhone(body.get("phone"));
                if (body.containsKey("address")) user.setAddress(body.get("address"));
                
                userRepository.save(user);
                
                return ResponseEntity.ok(Map.of(
                        "message", "Profile updated successfully",
                        "firstName", user.getFirstName(),
                        "lastName", user.getLastName(),
                        "email", user.getEmail(),
                        "phone", user.getPhone() != null ? user.getPhone() : "",
                        "address", user.getAddress() != null ? user.getAddress() : "",
                        "role", user.getRole()
                ));
            }).orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid token"));
        }
    }

    // ── Forgot Password ───────────────────────────────────
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email is required."));
        }

        var userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "No account found with that email."));
        }

        User user = userOpt.get();

        // Generate a random 10-character password
        String newPassword = generateRandomPassword(10);

        // Hash and save
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        return ResponseEntity.ok(Map.of(
            "message", "Your new password has been generated.",
            "newPassword", newPassword
        ));
    }

    // ── Helper: generate random password ──────────────────
    private String generateRandomPassword(int length) {
        String chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$";
        SecureRandom random = new SecureRandom();
        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            sb.append(chars.charAt(random.nextInt(chars.length())));
        }
        return sb.toString();
    }
}

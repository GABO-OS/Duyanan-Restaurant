package com.duyanan.backend.controller;

import com.duyanan.backend.model.*;
import com.duyanan.backend.repository.*;
import com.duyanan.backend.util.*;

import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/auth")
public class UserController {

    private static final int MAX_ATTEMPTS = 3;
    private static final long LOCKOUT_DURATION = 15 * 60; // 15 minutes in seconds

    // email -> number of failed attempts
    private final ConcurrentHashMap<String, Integer> failedAttempts = new ConcurrentHashMap<>();
    // email -> time when the lockout expires (epoch second)
    private final ConcurrentHashMap<String, Long> lockoutExpiry = new ConcurrentHashMap<>();

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

        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "Registration successful!"));
    }

    // ── Login ─────────────────────────────────────────────
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String password = body.get("password");

        // 1. Check if currently locked out
        Long expiry = lockoutExpiry.get(email);
        long now = Instant.now().getEpochSecond();
        if (expiry != null && now < expiry) {
            long secondsLeft = expiry - now;
            long minutes = secondsLeft / 60;
            long seconds = secondsLeft % 60;
            String timeMsg = minutes > 0
                    ? minutes + " minute" + (minutes > 1 ? "s" : "") + " and " + seconds + " second"
                            + (seconds != 1 ? "s" : "")
                    : seconds + " second" + (seconds != 1 ? "s" : "");
            return ResponseEntity.status(429).body(Map.of(
                    "error", "Account temporarily blocked. Please try again in " + timeMsg + ".",
                    "lockedOut", true,
                    "secondsLeft", secondsLeft));
        }

        // 2. Attempt authentication
        java.util.Optional<User> userOpt = userRepository.findByEmail(email);
        boolean success = userOpt.map(u -> passwordEncoder.matches(password, u.getPassword())).orElse(false);

        if (success) {
            // Clear any previous failure state
            failedAttempts.remove(email);
            lockoutExpiry.remove(email);

            User u = userOpt.get();
            String token = jwtUtil.generateToken(u.getId(), u.getEmail(), u.getRole());

            return ResponseEntity.ok(Map.of(
                    "message", "Login successful!",
                    "firstName", u.getFirstName(),
                    "lastName", u.getLastName(),
                    "email", u.getEmail(),
                    "role", u.getRole(),
                    "token", token));
        }

        // 3. Record failure
        int attempts = failedAttempts.merge(email, 1, (a, b) -> a + b);

        if (attempts >= MAX_ATTEMPTS) {
            lockoutExpiry.put(email, now + LOCKOUT_DURATION);
            failedAttempts.remove(email); // reset so counter starts fresh after lockout
            return ResponseEntity.status(429).body(Map.of(
                    "error", "Too many failed attempts. Account blocked for 15 minutes.",
                    "lockedOut", true,
                    "secondsLeft", LOCKOUT_DURATION));
        }

        int remaining = MAX_ATTEMPTS - attempts;
        return ResponseEntity.status(401).body(Map.of(
                "error",
                "Invalid email or password. " + remaining + " attempt" + (remaining == 1 ? "" : "s") + " remaining.",
                "attemptsLeft", remaining));
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
                            "role", u.getRole())))
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid token"));
        }
    }
}

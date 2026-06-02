package com.duyanan.backend;

import com.duyanan.backend.model.*;
import com.duyanan.backend.repository.*;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Arrays;

@Component
public class DataSeeder implements CommandLineRunner {

    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(ProductRepository productRepository, UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {

        // ── Seed admin user ──────────────────────────────────
        if (!userRepository.existsByEmail("admin@duyanan.com")) {
            User admin = new User();
            admin.setFirstName("Admin");
            admin.setLastName("Duyanan");
            admin.setEmail("admin@duyanan.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole("ADMIN");
            userRepository.save(admin);
            System.out.println("✅ Default admin account created: admin@duyanan.com / admin123");
        }

        if (productRepository.count() == 0) {

            // — Appetizers / Extras —
            Product turon = new Product();
            turon.setName("Lumpiang Turon");
            turon.setPriceSolo(50.00);
            turon.setDescription("10pcs | Crispy banana spring rolls");
            turon.setImageUrl("https://placehold.co/300x200/8B4513/white?text=Turon");
            turon.setCategory("Extras");

            Product kare = new Product();
            kare.setName("Kare-Kare Bites");
            kare.setPriceSolo(75.00);
            kare.setDescription("5pcs | Peanut-glazed skewers");
            kare.setImageUrl("https://placehold.co/300x200/8B4513/white?text=Kare-Kare");
            kare.setCategory("Extras");

            // — Sizzling Meals —
            Product sfc = new Product();
            sfc.setName("Sizzling Fried Chicken");
            sfc.setPriceSolo(109.00);
            sfc.setPriceALaCarte(159.00);
            sfc.setDescription("Solo | Ala Carte");
            sfc.setImageUrl("https://placehold.co/300x200/8B4513/white?text=SFC");
            sfc.setCategory("Sizzling Meals");

            Product inasal = new Product();
            inasal.setName("Chicken Inasal");
            inasal.setPriceSolo(120.00);
            inasal.setPriceALaCarte(170.00);
            inasal.setDescription("Solo | Ala Carte | Grilled to perfection");
            inasal.setImageUrl("https://placehold.co/300x200/8B4513/white?text=Inasal");
            inasal.setCategory("Sizzling Meals");

            // — Duyanan Specials —
            Product habhab = new Product();
            habhab.setName("Pancit Habhab");
            habhab.setPriceALaCarte(250.00);
            habhab.setDescription("Good for 3–4 | Authentic Lucban noodles");
            habhab.setImageUrl("https://placehold.co/300x200/8B4513/white?text=Habhab");
            habhab.setCategory("Duyanan Specials");

            Product lechon = new Product();
            lechon.setName("Lechon Kawali");
            lechon.setPriceALaCarte(320.00);
            lechon.setDescription("Good for 3–4 | Crispy pork belly");
            lechon.setImageUrl("https://placehold.co/300x200/8B4513/white?text=Lechon");
            lechon.setCategory("Duyanan Specials");

            // — Student Meals —
            Product kidsMeal = new Product();
            kidsMeal.setName("Kids Chicken & Rice");
            kidsMeal.setPriceSolo(89.00);
            kidsMeal.setDescription("With fries & juice");
            kidsMeal.setImageUrl("https://placehold.co/300x200/8B4513/white?text=Kids+Meal");
            kidsMeal.setCategory("Student Meals");

            // — Drinks —
            Product buko = new Product();
            buko.setName("Buko Juice");
            buko.setPriceSolo(45.00);
            buko.setDescription("Fresh young coconut");
            buko.setImageUrl("https://placehold.co/300x200/8B4513/white?text=Buko");
            buko.setCategory("Drinks");

            Product calamansi = new Product();
            calamansi.setName("Calamansi Juice");
            calamansi.setPriceSolo(40.00);
            calamansi.setDescription("Freshly squeezed | Regular or sugar-free");
            calamansi.setImageUrl("https://placehold.co/300x200/8B4513/white?text=Calamansi");
            calamansi.setCategory("Drinks");

            productRepository.saveAll(Arrays.asList(
                turon, kare,
                sfc, inasal,
                habhab, lechon,
                kidsMeal,
                buko, calamansi
            ));
        }
    }
}

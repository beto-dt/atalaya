package dev.luisdelatorre.atalaya.auth;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    public record LoginRequest(@NotBlank String email, @NotBlank String password) {}
    public record TokenResponse(String token) {}

    private final UserAccountRepository users;
    private final PasswordEncoder encoder;
    private final JwtEncoder jwt;

    public AuthController(UserAccountRepository users, PasswordEncoder encoder, JwtEncoder jwt) {
        this.users = users;
        this.encoder = encoder;
        this.jwt = jwt;
    }

    @PostMapping("/login")
    public TokenResponse login(@Valid @RequestBody LoginRequest request) {
        var user = users.findByEmail(request.email().trim().toLowerCase())
                .filter(u -> encoder.matches(request.password(), u.getPasswordHash()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "bad_credentials"));

        var claims = JwtClaimsSet.builder()
                .subject(user.getEmail())
                .issuedAt(Instant.now())
                .expiresAt(Instant.now().plus(30, ChronoUnit.DAYS))
                .build();
        var header = JwsHeader.with(MacAlgorithm.HS256).build();
        return new TokenResponse(jwt.encode(JwtEncoderParameters.from(header, claims)).getTokenValue());
    }

    /** Seeds the single user from env vars on first boot (personal tool: no public sign-up). */
    @Bean
    ApplicationRunner seedUser(
            UserAccountRepository users, PasswordEncoder encoder,
            @Value("${atalaya.seed-user.email}") String email,
            @Value("${atalaya.seed-user.password}") String password) {
        return args -> {
            if (users.count() == 0 && !email.isBlank() && !password.isBlank()) {
                users.save(new UserAccount(email.trim().toLowerCase(), encoder.encode(password)));
            }
        };
    }
}

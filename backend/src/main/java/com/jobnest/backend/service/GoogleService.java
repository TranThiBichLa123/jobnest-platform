package com.jobnest.backend.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class GoogleService {

    private final GoogleIdTokenVerifier verifier;

    public GoogleIdToken.Payload verify(String idTokenString) {
        try {
            GoogleIdToken token = verifier.verify(idTokenString);
            if (token == null) {
                throw new RuntimeException("Invalid Google Token");
            }
            return token.getPayload();

        } catch (Exception e) {
            throw new RuntimeException("Google Token verification failed", e);
        }
    }
}

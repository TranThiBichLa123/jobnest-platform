package com.jobnest.backend.service;

import com.jobnest.backend.dto.request.RegisterRequest;
import com.jobnest.backend.entities.auth.Account;

public interface UserService {
    Account register(RegisterRequest req);

}

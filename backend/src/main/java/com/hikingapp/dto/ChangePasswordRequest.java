package com.hikingapp.dto;

public record ChangePasswordRequest(String currentPassword, String newPassword) {}

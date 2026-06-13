package com.example.project.model;

public enum Role {
    ROLE_USER(1),
    ROLE_ADMIN(2),
    ROLE_MANAGER(3);

    private final int databaseValue;

    Role(int databaseValue) {
        this.databaseValue = databaseValue;
    }

    public int getDatabaseValue() {
        return databaseValue;
    }

    public static Role fromDatabaseValue(Integer databaseValue) {
        if (databaseValue == null) {
            return null;
        }

        for (Role role : values()) {
            if (role.databaseValue == databaseValue) {
                return role;
            }
        }

        throw new IllegalArgumentException("Unknown role value: " + databaseValue);
    }
}

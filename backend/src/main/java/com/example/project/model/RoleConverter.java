package com.example.project.model;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class RoleConverter implements AttributeConverter<Role, Integer> {
    @Override
    public Integer convertToDatabaseColumn(Role role) {
        return role == null ? null : role.getDatabaseValue();
    }

    @Override
    public Role convertToEntityAttribute(Integer databaseValue) {
        return Role.fromDatabaseValue(databaseValue);
    }
}

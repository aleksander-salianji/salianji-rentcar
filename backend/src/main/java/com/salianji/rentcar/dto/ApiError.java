package com.salianji.rentcar.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.util.Map;

// Formati i çdo gabimi që kthen API-ja
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ApiError(String message, Map<String, String> errors) {
}

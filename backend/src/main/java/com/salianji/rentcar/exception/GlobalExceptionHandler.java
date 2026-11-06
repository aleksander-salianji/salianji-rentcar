package com.salianji.rentcar.exception;

import com.salianji.rentcar.dto.ApiError;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.multipart.support.MissingServletRequestPartException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.util.LinkedHashMap;
import java.util.Map;

// Kthen të gjitha gabimet si JSON: { "message": "...", "errors": { ... } }
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(ApiException.class)
    public ResponseEntity<ApiError> handleApi(ApiException ex) {
        return ResponseEntity.status(ex.getStatus()).body(new ApiError(ex.getMessage(), null));
    }

    // Gabimet nga @Valid (p.sh. @NotBlank, @Email)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new LinkedHashMap<>();
        for (FieldError fe : ex.getBindingResult().getFieldErrors()) {
            errors.putIfAbsent(fe.getField(), fe.getDefaultMessage());
        }
        String message = errors.isEmpty()
            ? "Të dhënat nuk janë të vlefshme."
            : errors.values().iterator().next();
        return ResponseEntity.badRequest().body(new ApiError(message, errors));
    }

    @ExceptionHandler({HttpMessageNotReadableException.class, MethodArgumentTypeMismatchException.class})
    public ResponseEntity<ApiError> handleBadInput(Exception ex) {
        return ResponseEntity.badRequest().body(new ApiError("Të dhënat e dërguara nuk janë në formatin e duhur.", null));
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ApiError> handleTooLarge(MaxUploadSizeExceededException ex) {
        return ResponseEntity.badRequest().body(new ApiError("Foto është shumë e madhe (maksimumi 5 MB).", null));
    }

    @ExceptionHandler(MissingServletRequestPartException.class)
    public ResponseEntity<ApiError> handleMissingPart(MissingServletRequestPartException ex) {
        return ResponseEntity.badRequest().body(new ApiError("Zgjidh një foto.", null));
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiError> handleIntegrity(DataIntegrityViolationException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
            .body(new ApiError("Veprimi bie ndesh me të dhënat ekzistuese.", null));
    }

    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<ApiError> handleNotFound(NoResourceFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ApiError("Rruga nuk ekziston.", null));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> handleOther(Exception ex) {
        log.error("Gabim i papritur", ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(new ApiError("Ndodhi një gabim në server. Provo përsëri.", null));
    }
}

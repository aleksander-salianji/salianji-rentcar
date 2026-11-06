package com.salianji.rentcar.controller;

import com.salianji.rentcar.dto.BlogPostDto;
import com.salianji.rentcar.dto.BlogPostRequest;
import com.salianji.rentcar.dto.BlogPostSummaryDto;
import com.salianji.rentcar.service.BlogService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

// GET /api/blog/** → publik · /api/admin/blog/** → vetëm ADMIN
@RestController
public class BlogController {

    private final BlogService blogService;

    public BlogController(BlogService blogService) {
        this.blogService = blogService;
    }

    // ---------- PUBLIKE ----------

    @GetMapping("/api/blog")
    public List<BlogPostSummaryDto> list() {
        return blogService.listPublished();
    }

    @GetMapping("/api/blog/{slug}")
    public BlogPostDto get(@PathVariable String slug) {
        return blogService.getPublished(slug);
    }

    // ---------- ADMIN ----------

    @GetMapping("/api/admin/blog")
    public List<BlogPostDto> adminList() {
        return blogService.listAll();
    }

    @PostMapping("/api/admin/blog")
    @ResponseStatus(HttpStatus.CREATED)
    public BlogPostDto create(@Valid @RequestBody BlogPostRequest request) {
        return blogService.create(request);
    }

    @PutMapping("/api/admin/blog/{id}")
    public BlogPostDto update(@PathVariable Long id, @Valid @RequestBody BlogPostRequest request) {
        return blogService.update(id, request);
    }

    @DeleteMapping("/api/admin/blog/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        blogService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping(value = "/api/admin/blog/{id}/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public BlogPostDto uploadImage(@PathVariable Long id, @RequestParam("file") MultipartFile file) {
        return blogService.uploadImage(id, file);
    }
}

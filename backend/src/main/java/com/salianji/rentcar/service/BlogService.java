package com.salianji.rentcar.service;

import com.salianji.rentcar.dto.BlogPostDto;
import com.salianji.rentcar.dto.BlogPostRequest;
import com.salianji.rentcar.dto.BlogPostSummaryDto;
import com.salianji.rentcar.exception.ApiException;
import com.salianji.rentcar.model.BlogPost;
import com.salianji.rentcar.repository.BlogPostRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.text.Normalizer;
import java.time.Instant;
import java.util.List;
import java.util.Locale;

@Service
public class BlogService {

    private final BlogPostRepository repository;
    private final ImageStorageService imageStorage;

    public BlogService(BlogPostRepository repository, ImageStorageService imageStorage) {
        this.repository = repository;
        this.imageStorage = imageStorage;
    }

    // ---------- PUBLIKE ----------

    @Transactional(readOnly = true)
    public List<BlogPostSummaryDto> listPublished() {
        return repository.findByPublishedTrueOrderByPublishedAtDesc().stream().map(BlogPostSummaryDto::from).toList();
    }

    @Transactional(readOnly = true)
    public BlogPostDto getPublished(String slug) {
        return repository.findBySlugAndPublishedTrue(slug)
            .map(BlogPostDto::from)
            .orElseThrow(() -> ApiException.notFound("Artikulli nuk u gjet."));
    }

    // ---------- ADMIN ----------

    @Transactional(readOnly = true)
    public List<BlogPostDto> listAll() {
        return repository.findAllByOrderByCreatedAtDesc().stream().map(BlogPostDto::from).toList();
    }

    @Transactional
    public BlogPostDto create(BlogPostRequest req) {
        BlogPost p = new BlogPost();
        apply(p, req);
        repository.save(p);
        return BlogPostDto.from(p);
    }

    @Transactional
    public BlogPostDto update(Long id, BlogPostRequest req) {
        BlogPost p = find(id);
        String oldImage = p.getCoverImageUrl();
        apply(p, req);
        if (oldImage != null && !oldImage.equals(p.getCoverImageUrl())) {
            imageStorage.deleteIfLocal(oldImage);
        }
        return BlogPostDto.from(p);
    }

    @Transactional
    public void delete(Long id) {
        BlogPost p = find(id);
        imageStorage.deleteIfLocal(p.getCoverImageUrl());
        repository.delete(p);
    }

    @Transactional
    public BlogPostDto uploadImage(Long id, MultipartFile file) {
        BlogPost p = find(id);
        String old = p.getCoverImageUrl();
        p.setCoverImageUrl(imageStorage.storeBlogImage(id, file));
        imageStorage.deleteIfLocal(old);
        return BlogPostDto.from(p);
    }

    private BlogPost find(Long id) {
        return repository.findById(id).orElseThrow(() -> ApiException.notFound("Artikulli nuk u gjet."));
    }

    private void apply(BlogPost p, BlogPostRequest req) {
        p.setTitle(req.title().trim());
        p.setExcerpt(req.excerpt().trim());
        p.setContent(req.content().trim());
        p.setCategory(req.category().trim());
        p.setCoverImageUrl(req.coverImageUrl() == null || req.coverImageUrl().isBlank() ? null : req.coverImageUrl().trim());

        String base = slugify(req.slug() == null || req.slug().isBlank() ? req.title() : req.slug());
        p.setSlug(uniqueSlug(base.isEmpty() ? "artikull" : base, p.getId()));

        // data e publikimit vendoset herën e parë që publikohet
        if (req.published() && p.getPublishedAt() == null) {
            p.setPublishedAt(Instant.now());
        }
        p.setPublished(req.published());
    }

    private String uniqueSlug(String base, Long id) {
        String slug = base;
        for (int i = 2; id == null ? repository.existsBySlug(slug) : repository.existsBySlugAndIdNot(slug, id); i++) {
            slug = base + "-" + i;
        }
        return slug;
    }

    // "Udhëtim në Rivierë 2026!" → "udhetim-ne-riviere-2026"
    public static String slugify(String text) {
        String s = Normalizer.normalize(text, Normalizer.Form.NFD)
            .replaceAll("\\p{M}", "")             // ë → e, ç → c
            .toLowerCase(Locale.ROOT)
            .replaceAll("[^a-z0-9]+", "-")
            .replaceAll("(^-+|-+$)", "");
        return s.length() > 150 ? s.substring(0, 150).replaceAll("-+$", "") : s;
    }
}

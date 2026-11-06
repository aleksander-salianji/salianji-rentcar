package com.salianji.rentcar.dto;

import com.salianji.rentcar.model.BlogPost;

import java.time.Instant;

// I plotë (faqja e artikullit dhe paneli i adminit)
public record BlogPostDto(
    Long id,
    String title,
    String slug,
    String excerpt,
    String content,
    String coverImageUrl,
    String category,
    boolean published,
    Instant publishedAt,
    Instant updatedAt,
    int readMinutes
) {

    public static BlogPostDto from(BlogPost p) {
        return new BlogPostDto(p.getId(), p.getTitle(), p.getSlug(), p.getExcerpt(), p.getContent(),
            p.getCoverImageUrl(), p.getCategory(), p.isPublished(), p.getPublishedAt(), p.getUpdatedAt(),
            readMinutes(p.getContent()));
    }

    // ~200 fjalë në minutë
    static int readMinutes(String text) {
        int words = text == null || text.isBlank() ? 0 : text.trim().split("\\s+").length;
        return Math.max(1, Math.round(words / 200f));
    }
}

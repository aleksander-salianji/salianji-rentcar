package com.salianji.rentcar.dto;

import com.salianji.rentcar.model.BlogPost;

import java.time.Instant;

// Për listën e blogut (pa përmbajtjen e plotë)
public record BlogPostSummaryDto(
    Long id,
    String title,
    String slug,
    String excerpt,
    String coverImageUrl,
    String category,
    Instant publishedAt,
    int readMinutes
) {

    public static BlogPostSummaryDto from(BlogPost p) {
        return new BlogPostSummaryDto(p.getId(), p.getTitle(), p.getSlug(), p.getExcerpt(), p.getCoverImageUrl(),
            p.getCategory(), p.getPublishedAt(), BlogPostDto.readMinutes(p.getContent()));
    }
}

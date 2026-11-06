package com.salianji.rentcar.model;

import jakarta.persistence.*;

import java.time.Instant;

// Artikull i blogut. Përmbajtja është tekst i thjeshtë:
//   "## Titull"  → nëntitull
//   "- pikë"     → listë
//   rresht bosh  → paragraf i ri
@Entity
@Table(name = "blog_posts")
public class BlogPost {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String title;

    // adresa në URL: /blog/<slug>
    @Column(nullable = false, unique = true, length = 160)
    private String slug;

    @Column(nullable = false, length = 300)
    private String excerpt;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(length = 500)
    private String coverImageUrl;

    @Column(nullable = false, length = 40)
    private String category;

    @Column(nullable = false)
    private boolean published;

    private Instant publishedAt;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;

    @PrePersist
    void onCreate() {
        createdAt = Instant.now();
        updatedAt = createdAt;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = Instant.now();
    }

    public Long getId() { return id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }

    public String getExcerpt() { return excerpt; }
    public void setExcerpt(String excerpt) { this.excerpt = excerpt; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public String getCoverImageUrl() { return coverImageUrl; }
    public void setCoverImageUrl(String coverImageUrl) { this.coverImageUrl = coverImageUrl; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public boolean isPublished() { return published; }
    public void setPublished(boolean published) { this.published = published; }

    public Instant getPublishedAt() { return publishedAt; }
    public void setPublishedAt(Instant publishedAt) { this.publishedAt = publishedAt; }

    public Instant getCreatedAt() { return createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
}

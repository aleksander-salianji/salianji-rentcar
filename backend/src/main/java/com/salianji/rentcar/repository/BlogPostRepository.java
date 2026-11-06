package com.salianji.rentcar.repository;

import com.salianji.rentcar.model.BlogPost;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BlogPostRepository extends JpaRepository<BlogPost, Long> {

    List<BlogPost> findByPublishedTrueOrderByPublishedAtDesc();

    Optional<BlogPost> findBySlugAndPublishedTrue(String slug);

    List<BlogPost> findAllByOrderByCreatedAtDesc();

    boolean existsBySlug(String slug);

    boolean existsBySlugAndIdNot(String slug, Long id);
}

package com.hikingapp.repository;

import com.hikingapp.entity.Trail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface TrailRepository extends JpaRepository<Trail, Long> {

    @Query("""
        SELECT t FROM Trail t
        WHERE (:query IS NULL
               OR LOWER(t.name) LIKE LOWER(CONCAT('%', CAST(:query AS string), '%'))
               OR LOWER(t.location) LIKE LOWER(CONCAT('%', CAST(:query AS string), '%')))
        AND (:difficulty IS NULL OR t.difficulty = :difficulty)
        AND (:maxKm      IS NULL OR t.distanceKm <= :maxKm)
        ORDER BY t.name ASC
    """)
    List<Trail> search(
        @Param("query")      String query,
        @Param("difficulty") String difficulty,
        @Param("maxKm")      BigDecimal maxKm
    );
}

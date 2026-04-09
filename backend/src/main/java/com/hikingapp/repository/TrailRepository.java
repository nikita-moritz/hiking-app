package com.hikingapp.repository;

import com.hikingapp.entity.Trail;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TrailRepository extends JpaRepository<Trail, Long> {}

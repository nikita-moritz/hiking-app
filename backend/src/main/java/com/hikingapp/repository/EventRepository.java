package com.hikingapp.repository;

import com.hikingapp.entity.Event;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface EventRepository extends JpaRepository<Event, Long> {

    List<Event> findByStatusAndEventDateBetweenOrderByEventDateAsc(
            String status, LocalDateTime from, LocalDateTime to);

    List<Event> findByOrganizerIdOrderByEventDateAsc(Long organizerId);
}

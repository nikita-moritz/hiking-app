package com.hikingapp.repository;

import com.hikingapp.entity.Event;
import com.hikingapp.entity.EventStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface EventRepository extends JpaRepository<Event, Long> {
    List<Event> findByStatusOrderByEventDateAsc(EventStatus status);

    @Query("SELECT e FROM Event e WHERE e.organizer.id = :organizerId ORDER BY e.eventDate ASC")
    List<Event> findByOrganizerId(Long organizerId);
}

package com.hikingapp.entity;

import jakarta.persistence.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

@Entity
@Table(name = "users")
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    private boolean active = true;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    @Override public boolean isAccountNonExpired()  { return true; }
    @Override public boolean isAccountNonLocked()   { return true; }
    @Override public boolean isCredentialsNonExpired() { return true; }
    @Override public boolean isEnabled()            { return active; }

    @Override
    public String getUsername()          { return username; }
    @Override
    public String getPassword()          { return password; }

    public Long getId()                  { return id; }
    public String getEmail()             { return email; }
    public Role getRole()                { return role; }
    public boolean isActive()            { return active; }
    public LocalDateTime getCreatedAt()  { return createdAt; }
    public LocalDateTime getUpdatedAt()  { return updatedAt; }

    public void setId(Long id)                      { this.id = id; }
    public void setUsername(String username)        { this.username = username; }
    public void setEmail(String email)              { this.email = email; }
    public void setPassword(String password)        { this.password = password; }
    public void setRole(Role role)                  { this.role = role; }
    public void setActive(boolean active)           { this.active = active; }
    public void setCreatedAt(LocalDateTime t)       { this.createdAt = t; }
    public void setUpdatedAt(LocalDateTime t)       { this.updatedAt = t; }
}

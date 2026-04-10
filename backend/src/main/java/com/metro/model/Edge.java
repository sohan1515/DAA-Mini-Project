package com.metro.model;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Entity
@Table(name = "edges")
public class Edge {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "from_id")
    private String fromId;
    
    @Column(name = "to_id")
    private String toId;
    
    private BigDecimal distance;
    
    @Column(name = "crowd_weight")
    private BigDecimal crowdWeight = BigDecimal.ONE;
    
    @Column(name = "is_active")
    private Boolean isActive = true;
}
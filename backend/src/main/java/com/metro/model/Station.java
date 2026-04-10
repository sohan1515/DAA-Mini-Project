package com.metro.model;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Entity
@Table(name = "stations")
public class Station {
    @Id
    private String id;
    
    private String name;
    
    @Column(name = "crowd_level")
    private Integer crowdLevel;
    
    @Column(name = "line_id")
    private String lineId;
    
    private BigDecimal latitude;
    private BigDecimal longitude;
}
package org.cityu.lmsbackend.model;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import lombok.Data;

import java.io.Serializable;
import java.util.List;
import java.util.Map;

@Data
@JsonSerialize
@JsonDeserialize
public class Route implements Serializable {
    private List<String> packageRoute; // Location A -> Location B -> Location C
    private Map<String, Map<String, String>> tourGuide; // tourGuide.get(Location A).get(Location B) == how to go from A to B
}

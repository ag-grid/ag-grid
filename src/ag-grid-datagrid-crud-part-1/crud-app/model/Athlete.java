package com.aggrid.crudapp.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;

import javax.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Cacheable(false)
public class Athlete {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @Version()
    private Long version = 0L;

    private String name;

    @OneToOne()
    private Country country;

    @JsonManagedReference
    @OneToMany(cascade = CascadeType.ALL, mappedBy = "athlete", orphanRemoval = true)
    private List<Result> results = new ArrayList<>();

    public Athlete() {
    }

    public Athlete(String name, Country country, List<Result> results) {
        this.name = name;
        this.country = country;
        this.results = results;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Country getCountry() {
        return country;
    }

    public void setCountry(Country country) {
        this.country = country;
    }

    public List<Result> getResults() {
        return results;
    }

    public void setResults(List<Result> results) {
        this.results = results;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        Athlete athlete = (Athlete) o;

        if (id != null ? !id.equals(athlete.id) : athlete.id != null) return false;
        return name != null ? name.equals(athlete.name) : athlete.name == null;
    }

    @Override
    public int hashCode() {
        int result = id != null ? id.hashCode() : 0;
        result = 31 * result + (name != null ? name.hashCode() : 0);
        return result;
    }

    @Override
    public String toString() {
        return "Athlete{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", version='" + version + '\'' +
                '}';
    }
}

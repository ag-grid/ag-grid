package com.aggrid.crudapp.model;

import com.fasterxml.jackson.annotation.JsonBackReference;

import javax.persistence.*;

@Entity
public class Result {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @Version()
    private Long version = 0L;

    @JsonBackReference
    @ManyToOne(cascade = CascadeType.ALL)
    private Athlete athlete;

    private int age;
    private int year;
    private String date;
    private int gold;
    private int silver;
    private int bronze;

    @OneToOne()
    private Sport sport;

    public Result() {
    }

    public Result(Sport sport, int age, int year, String date, int gold, int silver, int bronze) {
        this.sport = sport;
        this.age = age;
        this.year = year;
        this.date = date;
        this.gold = gold;
        this.silver = silver;
        this.bronze = bronze;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public int getAge() {
        return age;
    }

    public void setAge(int age) {
        this.age = age;
    }

    public int getYear() {
        return year;
    }

    public void setYear(int year) {
        this.year = year;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public int getGold() {
        return gold;
    }

    public void setGold(int gold) {
        this.gold = gold;
    }

    public int getSilver() {
        return silver;
    }

    public void setSilver(int silver) {
        this.silver = silver;
    }

    public int getBronze() {
        return bronze;
    }

    public void setBronze(int bronze) {
        this.bronze = bronze;
    }

    public Sport getSport() {
        return sport;
    }

    public void setSport(Sport sport) {
        this.sport = sport;
    }

    public Athlete getAthlete() {
        return athlete;
    }

    public void setAthlete(Athlete athlete) {
        this.athlete = athlete;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        Result result = (Result) o;

        if (age != result.age) return false;
        if (year != result.year) return false;
        if (gold != result.gold) return false;
        if (silver != result.silver) return false;
        if (bronze != result.bronze) return false;
        if (id != null ? !id.equals(result.id) : result.id != null) return false;
        if (version != null ? !version.equals(result.version) : result.version != null) return false;
        if (athlete != null ? !athlete.equals(result.athlete) : result.athlete != null) return false;
        if (date != null ? !date.equals(result.date) : result.date != null) return false;
        return sport != null ? sport.equals(result.sport) : result.sport == null;
    }

    @Override
    public int hashCode() {
        int result = id != null ? id.hashCode() : 0;
        result = 31 * result + (version != null ? version.hashCode() : 0);
        result = 31 * result + (athlete != null ? athlete.hashCode() : 0);
        result = 31 * result + age;
        result = 31 * result + year;
        result = 31 * result + (date != null ? date.hashCode() : 0);
        result = 31 * result + gold;
        result = 31 * result + silver;
        result = 31 * result + bronze;
        result = 31 * result + (sport != null ? sport.hashCode() : 0);
        return result;
    }

    @Override
    public String toString() {
        return "Result{" +
                "id=" + id +
                ", version=" + version +
                ", athlete=" + athlete +
                ", age=" + age +
                ", year=" + year +
                ", date='" + date + '\'' +
                ", gold=" + gold +
                ", silver=" + silver +
                ", bronze=" + bronze +
                ", sport=" + sport +
                '}';
    }
}

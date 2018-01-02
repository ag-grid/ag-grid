package com.aggrid.crudapp.controllers;

import com.aggrid.crudapp.model.Athlete;
import com.aggrid.crudapp.repositories.AthleteRepository;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@CrossOrigin(origins = "http://localhost:4200")
@RestController
public class AthleteController {
    private AthleteRepository athleteRepository;

    public AthleteController(AthleteRepository athleteRepository) {
        this.athleteRepository = athleteRepository;
    }

    @GetMapping("/athletes")
    public Iterable<Athlete> getAthletes() {
        return athleteRepository.findAll();
    }

    @GetMapping("/athlete")
    public Optional<Athlete> getAthlete(@RequestParam(value = "id") Long athleteId) {
        return athleteRepository.findById(athleteId);
    }

    @PostMapping("/saveAthlete")
    public Athlete saveAthlete(@RequestBody Athlete athlete) {
        return athleteRepository.save(athlete);
    }

    @PostMapping("/deleteAthlete")
    public void deleteAthlete(@RequestBody Long athleteId) {
        athleteRepository.deleteById(athleteId);
    }
}

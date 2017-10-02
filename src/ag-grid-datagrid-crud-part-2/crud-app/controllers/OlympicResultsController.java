package com.aggrid.crudapp.controllers;

import com.aggrid.crudapp.model.Athlete;
import com.aggrid.crudapp.repositories.AthleteRepository;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class OlympicResultsController {
    private AthleteRepository athleteRepository;

    public OlympicResultsController(AthleteRepository athleteRepository) {
        this.athleteRepository = athleteRepository;
    }

    @RequestMapping("/olympicData")
    public Iterable<Athlete> getOlympicData() {
        return athleteRepository.findAll();
    }
}

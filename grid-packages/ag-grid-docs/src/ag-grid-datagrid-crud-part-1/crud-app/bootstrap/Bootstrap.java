package com.aggrid.crudapp.bootstrap;

import com.aggrid.crudapp.model.Athlete;
import com.aggrid.crudapp.model.Country;
import com.aggrid.crudapp.model.Result;
import com.aggrid.crudapp.model.Sport;
import com.aggrid.crudapp.repositories.AthleteRepository;
import com.aggrid.crudapp.repositories.CountryRepository;
import com.aggrid.crudapp.repositories.SportRepository;
import org.springframework.context.ApplicationListener;
import org.springframework.context.event.ContextRefreshedEvent;
import org.springframework.stereotype.Component;

import java.util.*;

/*
* Bootstraps the application with test data
*/
@Component
public class Bootstrap implements ApplicationListener<ContextRefreshedEvent> {

    private CountryRepository countryRepository;
    private SportRepository sportRepository;
    private AthleteRepository athleteRepository;

    public Bootstrap(CountryRepository countryRepository,
                     SportRepository sportRepository,
                     AthleteRepository athleteRepository) {
        this.countryRepository = countryRepository;
        this.sportRepository = sportRepository;
        this.athleteRepository = athleteRepository;
    }

    @Override
    public void onApplicationEvent(ContextRefreshedEvent contextRefreshedEvent) {
        List<RawOlympicWinnerRecord> olympicWinnerRecords = loadOlympicWinnersRecords();

        Map<String, Country> countryNameToCountry = new HashMap<>();
        Map<String, Sport> sportNameToSport = new HashMap<>();
        buildMapForCountryAndSport(olympicWinnerRecords, countryNameToCountry, sportNameToSport);

        Map<String, List<Result>> athleteNameToResults = new HashMap<>();
        buildMapForResults(olympicWinnerRecords, sportNameToSport, athleteNameToResults);

        Map<String, Athlete> athletes = new HashMap<>();
        for (RawOlympicWinnerRecord olympicWinnerRecord : olympicWinnerRecords) {
            List<Result> resultsForAthlete = athleteNameToResults.get(olympicWinnerRecord.athlete);

            athletes.computeIfAbsent(olympicWinnerRecord.athlete, (key) -> {
                return new Athlete(olympicWinnerRecord.athlete,
                        countryNameToCountry.get(olympicWinnerRecord.country),
                        resultsForAthlete);
            });

            Athlete athlete = athletes.get(olympicWinnerRecord.athlete);

            for (Result resultForAthlete : resultsForAthlete) {
                resultForAthlete.setAthlete(athlete);
            }
        }

        // we now have the test data - save it to the database
        this.countryRepository.saveAll(countryNameToCountry.values());
        this.sportRepository.saveAll(sportNameToSport.values());
        this.athleteRepository.saveAll(athletes.values());
    }

    private void buildMapForResults(List<RawOlympicWinnerRecord> olympicWinnerRecords, Map<String, Sport> sportNameToSport, Map<String, List<Result>> athleteNameToResults) {
        for (RawOlympicWinnerRecord olympicWinnerRecord : olympicWinnerRecords) {
            athleteNameToResults.computeIfAbsent(olympicWinnerRecord.athlete, k -> new ArrayList<>()).add(
                    new Result(sportNameToSport.get(olympicWinnerRecord.sport),
                            olympicWinnerRecord.age,
                            olympicWinnerRecord.year,
                            olympicWinnerRecord.date,
                            olympicWinnerRecord.gold,
                            olympicWinnerRecord.silver,
                            olympicWinnerRecord.bronze
                    )
            );
        }
    }

    private void buildMapForCountryAndSport(List<RawOlympicWinnerRecord> olympicWinnerRecords, Map<String, Country> countryNameToCountry, Map<String, Sport> sportNameToSport) {
        for (RawOlympicWinnerRecord olympicWinnerRecord : olympicWinnerRecords) {
            countryNameToCountry.putIfAbsent(olympicWinnerRecord.country, new Country(olympicWinnerRecord.country));
            sportNameToSport.putIfAbsent(olympicWinnerRecord.sport, new Sport(olympicWinnerRecord.sport));
        }
    }

    private List<RawOlympicWinnerRecord> loadOlympicWinnersRecords() {
        CsvLoader csvLoader = new CsvLoader();
        return csvLoader.loadObjectList(RawOlympicWinnerRecord.class, "./olympicWinners.csv");
    }
}

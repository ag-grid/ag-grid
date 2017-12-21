package com.aggrid.crudapp;

import com.aggrid.crudapp.model.Athlete;
import com.aggrid.crudapp.model.Country;
import com.aggrid.crudapp.model.Result;
import com.aggrid.crudapp.model.Sport;
import com.aggrid.crudapp.repositories.AthleteRepository;
import com.aggrid.crudapp.repositories.CountryRepository;
import com.aggrid.crudapp.repositories.SportRepository;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.web.server.LocalServerPort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.junit4.SpringRunner;

import javax.transaction.Transactional;
import java.util.ArrayList;
import java.util.List;

import static org.hamcrest.Matchers.greaterThanOrEqualTo;
import static org.junit.Assert.*;

@RunWith(SpringRunner.class)
@SpringBootTest(classes = CrudAppApplication.class, webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Transactional
public class AthleteControllerTests {

    @LocalServerPort
    private int port;

    private TestRestTemplate restTemplate = new TestRestTemplate();

    @Autowired
    private CountryRepository countryRepository;

    @Autowired
    private AthleteRepository athleteRepository;

    @Autowired
    private SportRepository sportRepository;

    @Test
    public void testThatWeRetrieveTheExpectedNumberOfAthleteResults() {
        ResponseEntity<Athlete[]> response = restTemplate.getForEntity(createURLWithPort("/athletes"), Athlete[].class);

        assertEquals(response.getStatusCode(), HttpStatus.OK);

        Athlete[] athletes = response.getBody();

        // not ideal using greaterThan, but as the controller isn't transactional and these tests modify the db its necessary
        // a real world app would prob do tear downs etc between tests - for our purposes this is fine
        assertThat("number of athletes", athletes.length, greaterThanOrEqualTo(6955));
    }

    @Test
    public void testWeCanSaveNewAthleteToDatabase() {
        // given
        Country unitedStates = countryRepository.findByName("United States");

        Athlete newAthlete = new Athlete("Test Athlete",
                unitedStates,
                new ArrayList<>());

        // when
        ResponseEntity<Athlete> response = restTemplate.postForEntity(createURLWithPort("/saveAthlete"), newAthlete, Athlete.class);

        // expect
        Athlete createdAthlete = response.getBody();
        assertNotNull(createdAthlete.getId());
        assertEquals(newAthlete.getName(), createdAthlete.getName());
        assertEquals(newAthlete.getCountry(), createdAthlete.getCountry());
        assertEquals(newAthlete.getResults(), createdAthlete.getResults());
    }

    @Test
    public void testWeUpdateAnExistingAthlete() {
        // given
        Country australia = countryRepository.findByName("Australia");

        Athlete existingAthlete = athleteRepository.findByName("Michael Phelps");
        existingAthlete.setName("Mick Phelps");
        existingAthlete.setCountry(australia);

        // when
        ResponseEntity<Athlete> response = restTemplate.postForEntity(createURLWithPort("/saveAthlete"), existingAthlete, Athlete.class);

        // expect
        Athlete updatedAthlete = response.getBody();
        assertEquals("Mick Phelps", updatedAthlete.getName());
        assertEquals(australia, updatedAthlete.getCountry());
    }

    @Test
    public void testWeUpdateAnMultipleResults() {
        // given
        Athlete existingAthlete = athleteRepository.findByName("Petter Northug Jr.");

        // update an existing result, and add a new one
        List<Result> results = existingAthlete.getResults();
        Result existingResult = results.get(0);
        existingResult.setAge(100);
        existingResult.setGold(200);

        Sport cycling = sportRepository.findByName("Cycling");
        Result newResult = new Result(cycling, 101, 2017, "01/01/2017", 1, 2, 3);
        results.add(newResult);

        // when
        ResponseEntity<Athlete> response = restTemplate.postForEntity(createURLWithPort("/saveAthlete"), existingAthlete, Athlete.class);

        // expect
        Athlete updatedAthlete = response.getBody();
        List<Result> updatedAthleteResults = updatedAthlete.getResults();

        assertEquals(updatedAthleteResults.get(0), existingResult);

        Result newlyCreatedResult = updatedAthleteResults.get(1);
        assertEquals(newlyCreatedResult.getAge(), 101);
        assertEquals(newlyCreatedResult.getYear(), 2017);
        assertEquals(newlyCreatedResult.getDate(), "01/01/2017");
        assertEquals(newlyCreatedResult.getGold(), 1);
        assertEquals(newlyCreatedResult.getSilver(), 2);
        assertEquals(newlyCreatedResult.getBronze(), 3);
        assertEquals(newlyCreatedResult.getSport().getName(), "Cycling");
    }

    @Test
    public void testWeCanDeleteAnExistingAthlete() {
        // given
        Athlete existingAthlete = athleteRepository.findByName("Jenny Thompson");

        // when
        restTemplate.postForEntity(createURLWithPort("/deleteAthlete"), existingAthlete.getId(), Void.class);

        // expect
        existingAthlete = athleteRepository.findByName("Jenny Thompson");
        assertNull(existingAthlete);
    }

    private String createURLWithPort(String uri) {
        return "http://localhost:" + port + uri;
    }

    private String createURLWithPortAndAthleteId(String uri, Long athleteId) {
        return createURLWithPort(uri) + "?athleteId=" + athleteId;
    }
}

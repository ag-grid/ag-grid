package com.aggrid.crudapp.repositories;

import com.aggrid.crudapp.model.Athlete;
import org.springframework.data.repository.CrudRepository;

public interface AthleteRepository extends CrudRepository<Athlete, Long> {
    Athlete findByName(String name);
}

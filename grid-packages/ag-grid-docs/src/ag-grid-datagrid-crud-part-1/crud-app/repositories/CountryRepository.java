package com.aggrid.crudapp.repositories;

import com.aggrid.crudapp.model.Country;
import org.springframework.data.repository.CrudRepository;

public interface CountryRepository extends CrudRepository<Country, Long> {
    Country findByName(String name);
}

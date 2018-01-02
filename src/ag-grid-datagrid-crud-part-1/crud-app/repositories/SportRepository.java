package com.aggrid.crudapp.repositories;

import com.aggrid.crudapp.model.Sport;
import org.springframework.data.repository.CrudRepository;

public interface SportRepository extends CrudRepository<Sport, Long> {
    Sport findByName(String name);
}

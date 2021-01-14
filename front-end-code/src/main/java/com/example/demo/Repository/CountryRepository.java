package com.example.demo.Repository;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import com.example.demo.details.Country;
@Repository
public interface CountryRepository extends CrudRepository<Country,Integer> {

}

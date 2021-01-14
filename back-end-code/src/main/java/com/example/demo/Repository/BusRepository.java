package com.example.demo.Repository;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import com.example.demo.details.Bus;

@Repository

public interface BusRepository extends CrudRepository<Bus,Integer> {

}

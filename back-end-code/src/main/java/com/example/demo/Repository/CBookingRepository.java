package com.example.demo.Repository;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import com.example.demo.details.CBooking;


@Repository
public interface CBookingRepository extends CrudRepository<CBooking ,Integer> {

	

}

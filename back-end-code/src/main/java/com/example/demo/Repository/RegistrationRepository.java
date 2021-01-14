package com.example.demo.Repository;

import java.util.List;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import com.example.demo.details.Registration;


@Repository
public interface RegistrationRepository extends CrudRepository<Registration ,String>{
	
	

}

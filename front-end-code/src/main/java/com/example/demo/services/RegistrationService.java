package com.example.demo.services;

import java.util.List;


import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.stereotype.Service;

import com.example.demo.Repository.RegistrationRepository;
import com.example.demo.details.Registration;



@Service
public class RegistrationService {
	@Autowired
	RegistrationRepository rr;
	

	public List<Registration> get() {
		List<Registration> r1=(List<Registration>)rr.findAll();	 
		 return r1;
		
	}

	public void post(Registration r1) {
		 rr.save(r1);
	}

	public void put(Registration r1, String e) {
		 rr.save(r1);
		
	}

	public void delet(String e) {
		rr.deleteById(e);
		
	}

	public void changepwd(String password, String id) {
		Registration reg=rr.findById(id).get();
reg.setPassword(password);
rr.save(reg);
		
			
	
	}

}

package com.example.demo.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.Repository.CBookingRepository;

import com.example.demo.details.CBooking;
@Service
public class CBookingServices {
	
		@Autowired
		CBookingRepository cr;

	public List<CBooking> get() {
		List<CBooking> b1=(List<CBooking>)cr.findAll();	 
		 return b1;
	}

	public void post(CBooking r1) {
		
		cr.save(r1);
		
	}

	public void put(CBooking r1, String e) {
		cr.save(r1);
		
	}

	public void delet(int e) {
		cr.deleteById(e);
		
	}

	

}

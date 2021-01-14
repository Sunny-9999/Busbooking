package com.example.demo.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.details.CBooking;
import com.example.demo.services.CBookingServices;

@RestController
public class CBookingController {
	@Autowired
    CBookingServices cs4;
	@RequestMapping(method=RequestMethod.GET,value=("cb"))
	public List<CBooking> get(){
		return cs4.get();
	}
	@RequestMapping(method=RequestMethod.POST,value=("cb"))
	public void post(@RequestBody CBooking r1, String email){
		
		r1.setEmail(email);
		
		cs4.post(r1);
	}
	
	@RequestMapping(method=RequestMethod.PUT,value=("cb"))
	public void put(@RequestBody CBooking r1,@PathVariable String e){
		cs4.put(r1,e);
	}
	@RequestMapping(method=RequestMethod.DELETE,value=("cb"))
	public void delet(@RequestParam int bk){
		cs4.delet(bk);
	}

}

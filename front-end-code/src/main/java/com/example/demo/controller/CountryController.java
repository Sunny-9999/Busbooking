package com.example.demo.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.Repository.CountryRepository;

import com.example.demo.details.Country;


@RestController
public class CountryController {
	@Autowired
	CountryRepository cr;
	
	
	@RequestMapping(method=RequestMethod.GET,value=("/c"))
	public List<Country> cget(){
		return (List<Country>)cr.findAll();
	}
	@RequestMapping(method=RequestMethod.POST,value=("/c"))
	public void getRegid(@RequestBody Country id){
	
	
		cr.save(id);
		
	}

}

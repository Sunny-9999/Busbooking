package com.example.demo.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.Repository.RegistrationRepository;
import com.example.demo.details.Registration;
import com.example.demo.services.RegistrationService;


@RestController
public class RegistrationController {
 
	@Autowired
	RegistrationService rs;
	
	
	@RequestMapping(method=RequestMethod.GET,value=(""))
	public List<Registration> get(){
		return rs.get();
	}
	@RequestMapping(method=RequestMethod.POST,value=(""))
	public void post(@RequestBody Registration r1){
		rs.post(r1);
	}
	
	@RequestMapping(method=RequestMethod.PUT,value=(""))
	public void put(@RequestBody Registration r1,@PathVariable String e){
		rs.put(r1,e);
	}
	@RequestMapping(method=RequestMethod.DELETE,value=(""))
	public void delet(@PathVariable String e){
		rs.delet(e);
	}
	@RequestMapping(method=RequestMethod.PUT,value="changepassword/{id}")
	public void changepwd(@RequestBody String password,@PathVariable String id){
		rs.changepwd(password,id);
	}
}

package com.example.demo.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.Repository.StateRepository;

import com.example.demo.details.State;


@RestController
public class StateController {
	@Autowired
	StateRepository sr;
	
	@RequestMapping(method=RequestMethod.GET,value=("/s"))
	public List<State> sget(){
		return (List<State>)sr.findAll();
	}
	@RequestMapping(method=RequestMethod.POST,value=("/s"))
	public void getRegid(@RequestBody State id){
	
	
		sr.save(id);
		
	}
	@RequestMapping(method=RequestMethod.GET,value=("/cid"))
	public List<State> cget(@RequestParam int cid){
		return sr.findByCId(cid);
	}

}

package com.example.demo.controller;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.details.Bus;
import com.example.demo.services.BusServices;

@RestController
public class BusController {
@Autowired	
BusServices bs;
	
	@RequestMapping(method=RequestMethod.GET,value=("/bus"))
	public List<Bus> getbus(){
		return bs.getbus();
		
	}
	@RequestMapping(method=RequestMethod.POST,value=("/bus"))
	public void postbus(@RequestBody Bus b){
		bs.postbus(b);
		
	}
	@RequestMapping(method=RequestMethod.PUT,value=("/bus"))
	public void putbus(@RequestBody Bus b,@PathVariable int i ){
		bs.putbus(b,i);
		
	}
	@RequestMapping(method=RequestMethod.DELETE,value=("/bus"))
	public void deletbus(@PathVariable int i ){
		bs.deletbus(i);
		
	}
	
	@RequestMapping(method=RequestMethod.POST,value="bus_id/{bus_id}")
	public void Seatsavb(@RequestBody int temp,@PathVariable int bus_id){
		bs.Searvb(bus_id,temp);
		
		
	}
}

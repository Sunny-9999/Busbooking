package com.example.demo.services;

import java.util.ArrayList;
import java.util.List;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.Repository.BusRepository;
import com.example.demo.details.Bus;
import com.example.demo.details.Registration;

@Service
public class BusServices {
@Autowired
	BusRepository br;
	public List<Bus> getbus() {
		List<Bus> b1=(List<Bus>)br.findAll();	 
		 return b1;
	}

	public void putbus(Bus b, int i) {
		br.save(b);
		
	}

	public void postbus(Bus b) {
		br.save(b);
		
	}

	public void deletbus(int i) {
		br.deleteById(i);
		
	}
	 

	public void Searvb(int bus_id,int temp ) {
		int x=0;
		Bus b=br.findById(bus_id).get(); 
		x=b.getNop()-temp;
		b.setNop(x);
		br.save(b);
		
	}

	

}

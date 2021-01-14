package com.example.demo.details;

import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;

@Entity
@Table(name="bustbl")
public class Bus {
@Id
private int bus_id;
private String img;

private String tod;
private String fromd;
private int nop;
private String date;
private String Busname;

public Bus(){
	
}

public int getBus_id() {
	return bus_id;
}

public void setBus_id(int bus_id) {
	this.bus_id = bus_id;
}

public String getTod() {
	return tod;
}

public void setTod(String tod) {
	this.tod = tod;
}

public String getFromd() {
	return fromd;
}

public void setFromd(String fromd) {
	this.fromd = fromd;
}

public int getNop() {
	return nop;
}

public void setNop(int nop) {
	this.nop = nop;
}

public String getDate() {
	return date;
}

public void setDate(String date) {
	this.date = date;
}

public String getBusname() {
	return Busname;
}
public String getImg() {
	return img;
}

public void setImg(String img) {
	this.img = img;
}


@Override
public String toString() {
	return "Bus [bus_id=" + bus_id + ", img=" + img + ", tod=" + tod + ", fromd=" + fromd + ", nop=" + nop + ", date="
			+ date + ", Busname=" + Busname + "]";
}

public Bus(int bus_id, String img, String tod, String fromd, int nop, String date, String busname) {
	super();
	this.bus_id = bus_id;
	this.img = img;
	this.tod = tod;
	this.fromd = fromd;
	this.nop = nop;
	this.date = date;
	Busname = busname;
}

public void setBusname(String busname) {
	Busname = busname;
}




}

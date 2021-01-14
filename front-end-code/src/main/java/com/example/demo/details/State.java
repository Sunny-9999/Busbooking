package com.example.demo.details;

import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;
@Entity
@Table(name="State")
public class State {
	@Id
 private int sid;
 private String sname;
 @ManyToOne
 @JoinColumn(name="cid")
 private Country c;
 public State() {
	 
 }
 
public State(int sid, String sname, Country c) {
	super();
	this.sid = sid;
	this.sname = sname;
	this.c = c;
}
public int getSid() {
	return sid;
}
public void setSid(int sid) {
	this.sid = sid;
}
public String getSname() {
	return sname;
}
public void setSname(String sname) {
	this.sname = sname;
}
public Country getC() {
	return c;
}
public void setC(Country c) {
	this.c = c;
}
}

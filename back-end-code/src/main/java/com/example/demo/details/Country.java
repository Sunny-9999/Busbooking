package com.example.demo.details;

import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;

@Entity
@Table(name="Country")
public class Country {
	@Id
	private int id;
	private String Cname;
	public Country() {
		
	}
	public Country(int cid, String cname) {
		super();
		id = cid;
		Cname = cname;
	}
	public int getCid() {
		return id;
	}
	public void setCid(int cid) {
		id = cid;
	}
	public String getCname() {
		return Cname;
	}
	public void setCname(String cname) {
		Cname = cname;
	}

}

package com.example.demo.details;

import javax.persistence.Entity;

import javax.persistence.Id;
import javax.persistence.Table;

import org.hibernate.annotations.GenericGenerator;




@Entity
@Table(name="Registration")
public class Registration {

@Id
@GenericGenerator(name="system-uuid",strategy="uuid")
private String email;
private String name;
private String password;

private String dOB;
private String phone_no;

private String address;
private String pincode;

public Registration() {
	
}

public String getEmail() {
	return email;
}

public void setEmail(String email) {
	this.email = email;
}

public String getName() {
	return name;
}

public void setName(String name) {
	this.name = name;
}

public String getPassword() {
	return password;
}

public void setPassword(String password) {
	this.password = password;
}

public String getdOB() {
	return dOB;
}

public void setdOB(String dOB) {
	this.dOB = dOB;
}

public String getPhone_no() {
	return phone_no;
}

public void setPhone_no(String phone_no) {
	this.phone_no = phone_no;
}

public String getAddress() {
	return address;
}

public void setAddress(String address) {
	this.address = address;
}

public String getPincode() {
	return pincode;
}

public void setPincode(String pincode) {
	this.pincode = pincode;
}

@Override
public String toString() {
	return "Registration [email=" + email + ", name=" + name + ", password=" + password + ", dOB=" + dOB + ", phone_no="
			+ phone_no + ", address=" + address + ", pincode=" + pincode + "]";
}

public Registration(String email, String name, String password, String dOB, String phone_no, String address,
		String pincode) {
	super();
	this.email = email;
	this.name = name;
	this.password = password;
	this.dOB = dOB;
	this.phone_no = phone_no;
	this.address = address;
	this.pincode = pincode;
}


}

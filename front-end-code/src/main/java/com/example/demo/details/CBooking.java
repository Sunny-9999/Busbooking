package com.example.demo.details;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.Table;

@Entity
@Table(name="CBooking")
public class CBooking {
	@Id
	@GeneratedValue
	private int bookingid;
	public int getBookingid() {
		return bookingid;
	}

	public void setBookingid(int bookingid) {
		this.bookingid = bookingid;
	}

	private String email;
	private String fromd;
	private String tod;
	private String datejrny;
	private int nos;
	
	public CBooking()
	{
		
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public String getFromd() {
		return fromd;
	}

	public void setFromd(String fromd) {
		this.fromd = fromd;
	}

	public String getTod() {
		return tod;
	}

	public void setTod(String tod) {
		this.tod = tod;
	}

	public String getDatejrny() {
		return datejrny;
	}

	public void setDatejrny(String datejrny) {
		this.datejrny = datejrny;
	}

	public int getNos() {
		return nos;
	}

	public void setNos(int nos) {
		this.nos = nos;
	}

	public CBooking(int bookingid, String email, String fromd, String tod, String datejrny, int nos) {
		super();
		this.bookingid = bookingid;
		this.email = email;
		this.fromd = fromd;
		this.tod = tod;
		this.datejrny = datejrny;
		this.nos = nos;
	}

	@Override
	public String toString() {
		return "CBooking [bookingid=" + bookingid + ", email=" + email + ", fromd=" + fromd + ", tod=" + tod
				+ ", datejrny=" + datejrny + ", nos=" + nos + "]";
	}

	

	
	
	
	
	
}

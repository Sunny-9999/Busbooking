package com.example.demo.Repository;


import java.util.List;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import com.example.demo.details.State;
@Repository
public interface StateRepository extends CrudRepository <State,Integer>{

	List<State> findByCId(int cid);



	

}

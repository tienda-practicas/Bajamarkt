package com.bajamarkt.bajamarkt;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.web.servlet.ServletComponentScan;

@SpringBootApplication
@ServletComponentScan(basePackages = "com.bajamarkt.controllers")
public class BajamarktApplication {

	public static void main(String[] args) {
		SpringApplication.run(BajamarktApplication.class, args);
	}

}

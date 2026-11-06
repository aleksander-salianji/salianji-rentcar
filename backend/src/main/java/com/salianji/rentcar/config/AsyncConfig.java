package com.salianji.rentcar.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;

// Email-et dërgohen në sfond, që klienti të mos presë
@Configuration
@EnableAsync
public class AsyncConfig {
}

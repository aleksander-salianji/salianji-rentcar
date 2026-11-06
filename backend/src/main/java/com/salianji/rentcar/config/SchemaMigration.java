package com.salianji.rentcar.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.List;

// Ndryshimet në databazë që Hibernate (ddl-auto=update) nuk i bën vetë.
// Ekzekutohet në çdo nisje, por ndryshon vetëm atë që mungon.
//  1. bookings.user_id bëhet opsionale (klientët rezervojnë pa llogari)
//  2. emri/email-i i klientit kopjohen te rezervimet e vjetra
//  3. kolonat ENUM bëhen VARCHAR që të pranojnë vlera të reja (COMPANY, CAREER...)
@Component
@Order(1)
public class SchemaMigration implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(SchemaMigration.class);

    private final JdbcTemplate jdbc;

    public SchemaMigration(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @Override
    public void run(String... args) {
        if ("NO".equalsIgnoreCase(column("bookings", "user_id", "IS_NULLABLE"))) {
            jdbc.execute("ALTER TABLE bookings MODIFY user_id BIGINT NULL");
            log.info("bookings.user_id u bë opsionale.");
        }

        int copied = jdbc.update("""
            UPDATE bookings b JOIN users u ON u.id = b.user_id
            SET b.customer_first_name = u.first_name,
                b.customer_last_name  = u.last_name,
                b.customer_email      = u.email
            WHERE b.customer_email IS NULL
            """);
        if (copied > 0) {
            log.info("{} rezervime të vjetra morën emrin dhe email-in e klientit.", copied);
        }

        // Kolonat ENUM të MySQL nuk pranojnë vlera të reja (p.sh. COMPANY, CAREER) → VARCHAR
        toVarchar("users", "role");
        toVarchar("support_tickets", "topic");
        toVarchar("support_tickets", "status");
    }

    private void toVarchar(String table, String col) {
        if ("enum".equalsIgnoreCase(column(table, col, "DATA_TYPE"))) {
            jdbc.execute("ALTER TABLE " + table + " MODIFY " + col + " VARCHAR(20) NOT NULL");
            log.info("{}.{} u kthye në VARCHAR(20).", table, col);
        }
    }

    // Lexon një veti të kolonës nga information_schema (null nëse kolona nuk ekziston)
    private String column(String table, String column, String property) {
        List<String> rows = jdbc.queryForList(
            "SELECT " + property + " FROM information_schema.COLUMNS"
                + " WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?",
            String.class, table, column);
        return rows.isEmpty() ? null : rows.get(0);
    }
}

package example;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;

import java.sql.DriverManager;
import org.junit.jupiter.api.Test;
import org.testcontainers.containers.MySQLContainer;

class TodoRepositoryIT {
  @Test
  void connectsToFreshMySql() {
    try (MySQLContainer<?> mysql = new MySQLContainer<>("mysql:8.0.36")
        .withDatabaseName("labdb")
        .withUsername("test")
        .withPassword("test")) {
      mysql.start();
      assertDoesNotThrow(() -> {
        try (var connection = DriverManager.getConnection(
                mysql.getJdbcUrl(), mysql.getUsername(), mysql.getPassword());
            var statement = connection.createStatement()) {
          statement.execute("CREATE TABLE todo(id INT PRIMARY KEY)");
        }
      });
    }
  }
}

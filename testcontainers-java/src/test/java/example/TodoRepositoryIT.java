package example;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.sql.DriverManager;
import org.junit.jupiter.api.Test;
import org.testcontainers.containers.MySQLContainer;
import org.testcontainers.utility.DockerImageName;

class TodoRepositoryIT {
    private static final DockerImageName MYSQL_97 =
    DockerImageName
    .parse("container-registry.oracle.com/mysql/community-server:9.7")
    .asCompatibleSubstituteFor("mysql");

    @Test
  void connectsToFreshMySql() {
    try (MySQLContainer<?> mysql = new MySQLContainer<>(MYSQL_97)
        .withDatabaseName("labdb")
        .withUsername("test")
        .withPassword("test")) {
      mysql.start();
      assertDoesNotThrow(() -> {
          System.out.println("[INFO] MySQL image: " + mysql.getDockerImageName());

          try (var connection = DriverManager.getConnection(
                mysql.getJdbcUrl(), mysql.getUsername(), mysql.getPassword());
            var statement = connection.createStatement()) {
                try (var result = statement.executeQuery("SELECT VERSION()")) {
                    result.next();
                    System.out.println("[OK] MySQL Server version: " + result.getString(1));
                }
              statement.execute("""
                              CREATE TABLE todo(
                              id INT PRIMARY KEY,
                              title VARCHAR(100) NOT NULL)
                              """);
              System.out.println("[OK] CREATE TABLE todo");

              int insertedRows = statement.executeUpdate("""
                                    INSERT INTO todo(id, title)
                                    VALUES (1, 'Testcontainers lab')
                                    """);
              System.out.println("[OK] INSERT todo: " + insertedRows + " row");

              try (var result = statement.executeQuery("""
                                                     SELECT title FROM todo WHERE id = 1
                                                     """)) {
                  int id = result.getInt("id");
                  String title = result.getString("title");

                  System.out.println("[OK] SELECT todo: id=" + id + ", title=" + title);
                  assertEquals(1, id);
                  assertEquals("Testcontainers lab", title);
              }
            }
        });
    }
  }
}

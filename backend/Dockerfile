# Ndërton dhe nis backend-in Spring Boot (përdoret nga Railway/Render).
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn -q -B dependency:go-offline
COPY src ./src
RUN mvn -q -B -DskipTests package && cp target/*.jar app.jar

FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/app.jar app.jar
ENV SPRING_PROFILES_ACTIVE=prod \
    UPLOAD_DIR=/data/uploads \
    JAVA_TOOL_OPTIONS="-XX:MaxRAMPercentage=75"
EXPOSE 8080
CMD ["java", "-jar", "app.jar"]

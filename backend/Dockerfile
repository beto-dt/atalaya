# ---- Build stage: compile the jar with the same JDK we develop on ----
FROM eclipse-temurin:21-jdk AS build
WORKDIR /app

# Cache dependencies first: gradle files change less often than code.
COPY gradlew settings.gradle.kts build.gradle.kts ./
COPY gradle ./gradle
RUN ./gradlew dependencies --no-daemon || true

COPY src ./src
RUN ./gradlew bootJar --no-daemon

# ---- Runtime stage: slim JRE, no build tools shipped ----
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/build/libs/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]

# ---- Stage 1: The "Build" Stage ----
# We use an official Maven image that includes JDK 17, as specified in your pom.xml
FROM maven:3.9-eclipse-temurin-17 AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy the Maven wrapper files first
# This allows Docker to cache the dependencies layer
COPY .mvn .mvn
COPY mvnw .
COPY pom.xml .

# Make the Maven wrapper executable
RUN chmod +x mvnw

# Download all project dependencies
# This layer is cached and only re-runs if pom.xml changes
RUN ./mvnw dependency:go-offline

# Copy the rest of your application's source code
COPY src src

# Run the Maven package command to build the application
# We skip tests, as they aren't needed for the final image
RUN ./mvnw package -DskipTests

# ---- Stage 2: The "Run" Stage ----
# We switch to a minimal JRE (Java Runtime) image based on Alpine Linux
# This makes the final container small and secure
FROM eclipse-temurin:17-jre-alpine

# Set the working directory
WORKDIR /app

# Your application.properties specifies port 8080
EXPOSE 8080

# Copy the final packaged .war file from the 'builder' stage
# The name 'tucompass_pj-0.0.1-SNAPSHOT.war' comes from your pom.xml
COPY --from=builder /app/target/tucompass_pj-0.0.1-SNAPSHOT.war app.war

# This is the command that will run when the container starts
ENTRYPOINT ["java", "-jar", "app.war"]
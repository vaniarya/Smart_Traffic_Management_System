FROM maven:3.9-eclipse-temurin-17
WORKDIR /app
COPY . .
RUN mvn clean install -DskipTests
CMD java -jar target/*.jar --server.port=$PORT
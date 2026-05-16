# Bajamarkt Web Application

Bajamarkt is a web application developed in Java with Spring Boot that simulates an electronics store similar to :contentReference[oaicite:0]{index=0}. The application allows users to manage products and categories through a simple and intuitive web interface.

---

## Team Members

- B. Gonzalo Miranda
- Iván Acosta
- Moisés Martín

---

## Technologies Used

- Java 17
- Spring Boot
- Thymeleaf
- HTML5
- CSS3
- Maven
- MariaDB / MySQL
- Git and GitHub
- yEd Graph Editor

---

## Features

### Product Management
- List all products
- View product details
- Create new products
- Delete products

### Category Management
- List all categories
- View category details
- Create new categories
- Delete categories

### Additional Features
- Fully translated into English
- Basic CSS styling
- Git Flow workflow with Pull Requests and version tags

---

## Database Design

The database was designed using yEd Graph Editor.

The design process included:

1. Entity-Relationship (ER) Model
2. Relational Model
3. SQL scripts for table creation

### Main Entities

- Product
- Category

---

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/tienda-practicas/Bajamarkt.git
cd Bajamarkt
```

### 2. Configure the Database

```bash
Edit the src/main/resources/application.properties file and set your database credentials.
```

### 3. Build the Project

```bash
Windows

mvnw.cmd clean install

Linux/macOS

./mvnw clean install
```

### 4. Run the application

```bash
Windows

mvnw.cmd spring-boot:run

Linux/macOS

./mvnw spring-boot:run
```

### 5. Open the Application

```bash
Open your browser and navigate to:

http://localhost:8080
```

## Git Flow

The project follows the Git Flow branching model with the following branches:

<ul>
  <li><strong>main</strong> – Stable production-ready version</li>
  <li><strong>develop</strong> – Integration branch</li>
  <li><strong>feature/*</strong> – New feature branches</li>
</ul>

All features are developed in separate branches and merged through Pull Requests reviewed by another team member.

---

## Versioning

The project includes the following version tags:

<ul>
  <li><strong>v1.0</strong></li>
  <li><strong>v1.1</strong></li>
</ul>

The final version, <strong>v1.1</strong>, is published as a GitHub Release.

---

## License

This project was developed for educational purposes as part of a software development training program.

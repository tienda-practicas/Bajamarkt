package com.bajamarkt.utils;

import java.sql.Connection;

public class TestConexion {
    public static void main(String[] args) {
        System.out.println("Probando conexión a MariaDB...");
        try (Connection conn = DatabaseConnection.getConnection()) {
            if (conn != null && !conn.isClosed()) {
                System.out.println("✅ Conexión exitosa a " + conn.getCatalog());
                System.out.println("   URL: " + conn.getMetaData().getURL());
                System.out.println("   Usuario: " + conn.getMetaData().getUserName());
            }
        } catch (Exception e) {
            System.out.println("❌ Error al conectar: " + e.getMessage());
        }
    }
}
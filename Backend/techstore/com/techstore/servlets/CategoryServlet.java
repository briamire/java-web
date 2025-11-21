
package com.techstore.servlets;

import com.techstore.config.Database;
import com.google.gson.Gson;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import java.sql.*;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@WebServlet("/api/categories")

public class CategoryServlet extends HttpServlet {
    private Gson gson = new Gson();
    
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) 
            throws ServletException, IOException {
        resp.setContentType("application/json");
        resp.setCharacterEncoding("UTF-8");
        
        try {
            getAllCategories(resp);
        } catch (SQLException e) {
            sendError(resp, "Database error: " + e.getMessage());
        }
    }
    

    private void getAllCategories(HttpServletResponse resp) 
            throws SQLException, IOException {
        List<Map<String, Object>> categories = new ArrayList<>();
        Connection conn = Database.getConnection();
        
        String sql = "SELECT * FROM categories ORDER BY name";
        
        try (Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            
            while (rs.next()) {
                Map<String, Object> category = new HashMap<>();
                category.put("category_id", rs.getInt("category_id"));

                category.put("name", rs.getString("name"));
                category.put("description", rs.getString("description"));
                category.put("icon", rs.getString("icon"));
                categories.add(category);
            }
        }
        
        sendSuccess(resp, categories);
    }
    
    private void sendSuccess(HttpServletResponse resp, Object data) throws IOException {
        PrintWriter out = resp.getWriter();
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Success");

        response.put("data", data);
        out.print(gson.toJson(response));
        out.flush();
    }
    
    private void sendError(HttpServletResponse resp, String message) throws IOException {
        resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
        PrintWriter out = resp.getWriter();
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", message);
        response.put("data", null);
        out.print(gson.toJson(response));
        out.flush();
    }
}

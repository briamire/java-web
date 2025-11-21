
package com.techstore.servlets;

import com.techstore.config.Database;
import com.techstore.models.Product;
import com.google.gson.Gson;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import java.math.BigDecimal;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

@WebServlet("/api/products/*")

public class ProductServlet extends HttpServlet {
    private Gson gson = new Gson();
    
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) 
            throws ServletException, IOException {
        resp.setContentType("application/json");
        resp.setCharacterEncoding("UTF-8");
        
        String pathInfo = req.getPathInfo();
        
        try {
            if (pathInfo == null || pathInfo.equals("/")) {
                // Get all products
                getAllProducts(req, resp);
            } else if (pathInfo.matches("/\\d+")) 

{
                // Get product by ID
                int productId = Integer.parseInt(pathInfo.substring(1));
                getProductById(productId, resp);
            } else if (pathInfo.equals("/category")) {
                // Get products by category
                String categoryId = req.getParameter("id");
                getProductsByCategory(categoryId, resp);
            } else if (pathInfo.equals("/search")) {
                // Search products
                String query = req.getParameter("q");
                searchProducts(query, resp);
            }
        } catch (SQLException e) {
            sendError(resp, "Database error: " + 

e.getMessage());
        }
    }
    
    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) 
            throws ServletException, IOException {
        resp.setContentType("application/json");
        resp.setCharacterEncoding("UTF-8");
        
        try {
            Product product = gson.fromJson(req.getReader(), Product.class);
            addProduct(product, resp);
        } catch (SQLException e) {
            sendError(resp, "Database error: " + 

e.getMessage());
        }
    }
    
    @Override
    protected void doPut(HttpServletRequest req, HttpServletResponse resp) 
            throws ServletException, IOException {
        resp.setContentType("application/json");
        resp.setCharacterEncoding("UTF-8");
        
        String pathInfo = req.getPathInfo();
        
        try {
            if (pathInfo != null && pathInfo.matches("/\\d+")) {
                int productId = Integer.parseInt(pathInfo.substring(1));
                Product product = 

gson.fromJson(req.getReader(), Product.class);
                product.setProductId(productId);
                updateProduct(product, resp);
            }
        } catch (SQLException e) {
            sendError(resp, "Database error: " + e.getMessage());
        }
    }
    
    @Override
    protected void doDelete(HttpServletRequest req, HttpServletResponse resp) 
            throws ServletException, IOException {
        resp.setContentType("application/json");
        resp.setCharacterEncoding("UTF-8");
        

        String pathInfo = req.getPathInfo();
        
        try {
            if (pathInfo != null && pathInfo.matches("/\\d+")) {
                int productId = Integer.parseInt(pathInfo.substring(1));
                deleteProduct(productId, resp);
            }
        } catch (SQLException e) {
            sendError(resp, "Database error: " + e.getMessage());
        }
    }
    
    private void getAllProducts(HttpServletRequest req, HttpServletResponse resp) 
            throws SQLException, IOException {
        List<Product> products = new ArrayList<>();

        Connection conn = Database.getConnection();
        
        String sql = "SELECT p.*, c.name as category_name FROM products p " +
                    "LEFT JOIN categories c ON p.category_id = c.category_id " +
                    "ORDER BY p.created_at DESC";
        
        try (Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            
            while (rs.next()) {
                Product product = extractProductFromResultSet(rs);
                products.add(product);
            }
        }
        

        sendSuccess(resp, products);
    }
    
    private void getProductById(int productId, HttpServletResponse resp) 
            throws SQLException, IOException {
        Connection conn = Database.getConnection();
        
        String sql = "SELECT p.*, c.name as category_name FROM products p " +
                    "LEFT JOIN categories c ON p.category_id = c.category_id " +
                    "WHERE p.product_id = ?";
        
        try (PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setInt(1, productId);
            ResultSet rs = pstmt.executeQuery();
            
            if (rs.next()) {

                Product product = extractProductFromResultSet(rs);
                sendSuccess(resp, product);
            } else {
                sendError(resp, "Product not found");
            }
        }
    }
    
    private void getProductsByCategory(String categoryId, HttpServletResponse resp) 
            throws SQLException, IOException {
        List<Product> products = new ArrayList<>();
        Connection conn = Database.getConnection();
        
        String sql = "SELECT p.*, c.name as category_name FROM products p " +

                    "LEFT JOIN categories c ON p.category_id = c.category_id " +
                    "WHERE p.category_id = ? ORDER BY p.created_at DESC";
        
        try (PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setInt(1, Integer.parseInt(categoryId));
            ResultSet rs = pstmt.executeQuery();
            
            while (rs.next()) {
                Product product = extractProductFromResultSet(rs);
                products.add(product);
            }
        }
        
        sendSuccess(resp, products);
    }
    

    private void searchProducts(String query, HttpServletResponse resp) 
            throws SQLException, IOException {
        List<Product> products = new ArrayList<>();
        Connection conn = Database.getConnection();
        
        String sql = "SELECT p.*, c.name as category_name FROM products p " +
                    "LEFT JOIN categories c ON p.category_id = c.category_id " +
                    "WHERE p.name LIKE ? OR p.description LIKE ? " +
                    "ORDER BY p.created_at DESC";
        
        try (PreparedStatement pstmt = conn.prepareStatement(sql)) {
            String searchPattern = "%" + query + "%";
            pstmt.setString(1, searchPattern);

            pstmt.setString(2, searchPattern);
            ResultSet rs = pstmt.executeQuery();
            
            while (rs.next()) {
                Product product = extractProductFromResultSet(rs);
                products.add(product);
            }
        }
        
        sendSuccess(resp, products);
    }
    
    private void addProduct(Product product, HttpServletResponse resp) 
            throws SQLException, IOException {
        Connection conn = Database.getConnection();
        
        String sql = "INSERT INTO products (name, description, price, category_id, " +

                    "stock, image_url, rating) VALUES (?, ?, ?, ?, ?, ?, ?)";
        
        try (PreparedStatement pstmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            pstmt.setString(1, product.getName());
            pstmt.setString(2, product.getDescription());
            pstmt.setBigDecimal(3, product.getPrice());
            pstmt.setInt(4, product.getCategoryId());
            pstmt.setInt(5, product.getStock());
            pstmt.setString(6, product.getImageUrl());
            pstmt.setDouble(7, product.getRating());
            
            int affectedRows = 

pstmt.executeUpdate();
            
            if (affectedRows > 0) {
                ResultSet rs = pstmt.getGeneratedKeys();
                if (rs.next()) {
                    product.setProductId(rs.getInt(1));
                }
                sendSuccess(resp, product);
            } else {
                sendError(resp, "Failed to add product");
            }
        }
    }
    
    private void updateProduct(Product product, HttpServletResponse resp) 
            throws SQLException, IOException {
        Connection conn = 

Database.getConnection();
        
        String sql = "UPDATE products SET name=?, description=?, price=?, " +
                    "category_id=?, stock=?, image_url=?, rating=? WHERE product_id=?";
        
        try (PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, product.getName());
            pstmt.setString(2, product.getDescription());
            pstmt.setBigDecimal(3, product.getPrice());
            pstmt.setInt(4, product.getCategoryId());
            pstmt.setInt(5, product.getStock());
            pstmt.setString(6, product.getImageUrl());

            pstmt.setDouble(7, product.getRating());
            pstmt.setInt(8, product.getProductId());
            
            int affectedRows = pstmt.executeUpdate();
            
            if (affectedRows > 0) {
                sendSuccess(resp, product);
            } else {
                sendError(resp, "Product not found");
            }
        }
    }
    
    private void deleteProduct(int productId, HttpServletResponse resp) 
            throws SQLException, IOException {
        Connection conn = 

Database.getConnection();
        
        String sql = "DELETE FROM products WHERE product_id = ?";
        
        try (PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setInt(1, productId);
            int affectedRows = pstmt.executeUpdate();
            
            if (affectedRows > 0) {
                sendSuccess(resp, "Product deleted successfully");
            } else {
                sendError(resp, "Product not found");
            }
        }
    }
    

    private Product extractProductFromResultSet(ResultSet rs) throws SQLException {
        Product product = new Product();
        product.setProductId(rs.getInt("product_id"));
        product.setName(rs.getString("name"));
        product.setDescription(rs.getString("description"));
        product.setPrice(rs.getBigDecimal("price"));
        product.setCategoryId(rs.getInt("category_id"));
        product.setCategoryName(rs.getString("category_name"));
        product.setStock(rs.getInt("stock"));

        product.setImageUrl(rs.getString("image_url"));
        product.setRating(rs.getDouble("rating"));
        product.setCreatedAt(rs.getTimestamp("created_at"));
        product.setUpdatedAt(rs.getTimestamp("updated_at"));
        return product;
    }
    
    private void sendSuccess(HttpServletResponse resp, Object data) throws IOException {
        PrintWriter out = resp.getWriter();
        out.print(gson.toJson(new Response(true, "Success", data)));
        out.flush();

    }
    
    private void sendError(HttpServletResponse resp, String message) throws IOException {
        resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
        PrintWriter out = resp.getWriter();
        out.print(gson.toJson(new Response(false, message, null)));
        out.flush();
    }
    
    private static class Response {
        boolean success;
        String message;
        Object data;
        
        Response(boolean success, String message, Object data) {

            this.success = success;
            this.message = message;
            this.data = data;
        }
    }
}


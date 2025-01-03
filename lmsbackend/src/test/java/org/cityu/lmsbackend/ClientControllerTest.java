package org.cityu.lmsbackend;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.cityu.lmsbackend.mapper.InfrastructureServiceMapper;
import org.cityu.lmsbackend.utils.GetDriverInfoData;
import org.cityu.lmsbackend.utils.LoginRequestData;
import org.cityu.lmsbackend.utils.PackageFormData;
import org.cityu.lmsbackend.utils.PackageGetRequestData;
import org.junit.Rule;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.rules.ExpectedException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.test.web.servlet.result.MockMvcResultHandlers;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;

import javax.servlet.http.Cookie;

import java.sql.Timestamp;
import java.util.Date;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;

@SpringBootTest(classes = LmsbackendApplication.class)
@AutoConfigureMockMvc
@ActiveProfiles({"test"})
public class ClientControllerTest {
    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private InfrastructureServiceMapper infrastructureServiceMapper;
    @Rule
    public final ExpectedException exception = ExpectedException.none();
    @Test
    @DisplayName("Get all package by client name after logging in.")
    void testGetPackage01() throws Exception {
        Cookie c = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequestData("client1", "password1", "RECIPIENT"))))
                .andReturn()
                .getResponse().getCookie("satoken");
        MockHttpServletRequestBuilder requestBuilder = post("/api/v1/client/package")
                .cookie(c)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new GetDriverInfoData("client1")));
        MvcResult result = mockMvc.perform(requestBuilder)
                .andDo(MockMvcResultHandlers.print())
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andReturn();
        assertNotEquals("{}", result.getResponse().getContentAsString());
    }

    @Test
    @DisplayName("Get client / recipient profile.")
    void testGetInfo() throws Exception {
        Cookie c = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequestData("client1", "password1", "RECIPIENT"))))
                .andReturn()
                .getResponse().getCookie("satoken");
        MockHttpServletRequestBuilder requestBuilder = post("/api/v1/client/user-info")
                .cookie(c)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new GetDriverInfoData("client1")));
        MvcResult result = mockMvc.perform(requestBuilder)
                .andDo(MockMvcResultHandlers.print())
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andReturn();
        assertNotEquals("{}", result.getResponse().getContentAsString());
    }

    @Test
    @DisplayName("Get related routes for recipient with outstanding relationship with driver(s).")
    void testRelatedRoutes1() throws Exception {
        Cookie c = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequestData("client1", "password1", "RECIPIENT"))))
                .andReturn()
                .getResponse().getCookie("satoken");
        MockHttpServletRequestBuilder requestBuilder = post("/api/v1/client/get-all-responsible-drivers-info-by-recipient-username")
                .cookie(c)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new GetDriverInfoData("client1")));
        MvcResult result = mockMvc.perform(requestBuilder)
                .andDo(MockMvcResultHandlers.print())
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andReturn();
//        assertNotEquals("{}", result.getResponse().getContentAsString());
    }

    @Test
    @DisplayName("Get related routes for recipient without outstanding relationship with driver(s).")
    void testRelatedRoutes2() throws Exception {
        Cookie c = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequestData("client2", "password2", "RECIPIENT"))))
                .andReturn()
                .getResponse().getCookie("satoken");
        MockHttpServletRequestBuilder requestBuilder = post("/api/v1/client/get-all-responsible-drivers-info-by-recipient-username")
                .cookie(c)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new GetDriverInfoData("client2")));
        MvcResult result = mockMvc.perform(requestBuilder)
                .andDo(MockMvcResultHandlers.print())
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andReturn();
//        assertNotEquals("{}", result.getResponse().getContentAsString());
    }

    @Test
    @DisplayName("Add package with invalid height.")
    void testAddPackage1() throws Exception {
        Cookie c = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequestData("client1", "password1", "RECIPIENT"))))
                .andReturn()
                .getResponse().getCookie("satoken");
        MockHttpServletRequestBuilder requestBuilder = put("/api/v1/client/package")
                .cookie(c)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new PackageFormData("p2p114514", "fragile", 1.0, -1.0, 2.0, 3.0, "client2", "client1", "loc1", "123.2343,23.32432", "loc2", "123.2443,23.34432", "23:59", new Timestamp(System.currentTimeMillis()), 0, "")));
        MvcResult result = mockMvc.perform(requestBuilder)
                .andDo(MockMvcResultHandlers.print())
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andReturn();
        String content = result.getResponse().getContentAsString();
        assertEquals("\"CONFLICT\"", content);
    }

    @Test
    @DisplayName("Add package with invalid length.")
    void testAddPackage2() throws Exception {
        Cookie c = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequestData("client1", "password1", "RECIPIENT"))))
                .andReturn()
                .getResponse().getCookie("satoken");
        MockHttpServletRequestBuilder requestBuilder = put("/api/v1/client/package")
                .cookie(c)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new PackageFormData("p2p114514", "fragile", 1.0, 1.0, -2.0, 3.0, "client2", "client1", "loc1", "123.2343,23.32432", "loc2", "123.2443,23.34432", "23:59", new Timestamp(System.currentTimeMillis()), 0, "")));
        MvcResult result = mockMvc.perform(requestBuilder)
                .andDo(MockMvcResultHandlers.print())
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andReturn();
        String content = result.getResponse().getContentAsString();
        assertEquals("\"CONFLICT\"", content);
    }

    @Test
    @DisplayName("Add package with invalid width.")
    void testAddPackage3() throws Exception {
        Cookie c = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequestData("client1", "password1", "RECIPIENT"))))
                .andReturn()
                .getResponse().getCookie("satoken");
        MockHttpServletRequestBuilder requestBuilder = put("/api/v1/client/package")
                .cookie(c)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new PackageFormData("p2p114514", "fragile", 1.0, 1.0, 2.0, -3.0, "client2", "client1", "loc1", "123.2343,23.32432", "loc2", "123.2443,23.34432", "23:59", new Timestamp(System.currentTimeMillis()), 0, "")));
        MvcResult result = mockMvc.perform(requestBuilder)
                .andDo(MockMvcResultHandlers.print())
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andReturn();
        String content = result.getResponse().getContentAsString();
        assertEquals("\"CONFLICT\"", content);
    }

    @Test
    @DisplayName("Add package with invalid weight.")
    void testAddPackage4() throws Exception {
        Cookie c = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequestData("client1", "password1", "RECIPIENT"))))
                .andReturn()
                .getResponse().getCookie("satoken");
        MockHttpServletRequestBuilder requestBuilder = put("/api/v1/client/package")
                .cookie(c)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new PackageFormData("p2p114514", "fragile", -1.0, 1.0, 2.0, 3.0, "client2", "client1", "loc1", "123.2343,23.32432", "loc2", "123.2443,23.34432", "23:59", new Timestamp(System.currentTimeMillis()), 0, "")));
        MvcResult result = mockMvc.perform(requestBuilder)
                .andDo(MockMvcResultHandlers.print())
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andReturn();
        String content = result.getResponse().getContentAsString();
        assertEquals("\"CONFLICT\"", content);
    }

    @Test
    @DisplayName("Add package with invalid warehouse state.")
    void testAddPackage5() throws Exception {
        Cookie c = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequestData("client1", "password1", "RECIPIENT"))))
                .andReturn()
                .getResponse().getCookie("satoken");
        MockHttpServletRequestBuilder requestBuilder = put("/api/v1/client/package")
                .cookie(c)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new PackageFormData("p2p114514", "fragile", 1.0, 1.0, 2.0, 3.0, "client2", "client1", "loc1", "123.2343,23.32432", "loc2", "123.2443,23.34432", "23:59", new Timestamp(System.currentTimeMillis()), 2, "")));
        MvcResult result = mockMvc.perform(requestBuilder)
                .andDo(MockMvcResultHandlers.print())
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andReturn();
        String content = result.getResponse().getContentAsString();
        assertEquals("\"CONFLICT\"", content);
    }

    @Test
    @DisplayName("Add a p2p package successfully.")
    void testAddPackage6() throws Exception {
        Cookie c = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequestData("client1", "password1", "RECIPIENT"))))
                .andReturn()
                .getResponse().getCookie("satoken");
        assertNull(infrastructureServiceMapper.selectP2PPackageGivenUniquePackageId("p2p114514"));
        MockHttpServletRequestBuilder requestBuilder = put("/api/v1/client/package")
                .cookie(c)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new PackageFormData("p2p114514", "fragile", 1.0, 1.0, 2.0, 3.0, "client2", "client1", "loc1", "123.2343,23.32432", "loc2", "123.2443,23.34432", "23:59", new Timestamp(System.currentTimeMillis()), 0, "")));
        MvcResult result = mockMvc.perform(requestBuilder)
                .andDo(MockMvcResultHandlers.print())
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andReturn();
        String content = result.getResponse().getContentAsString();
        assertNotNull(infrastructureServiceMapper.selectP2PPackageGivenUniquePackageId("p2p114514"));
    }

    @Test
    @DisplayName("Add a w2p package successfully.")
    void testAddPackage7() throws Exception {
        Cookie c = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequestData("client1", "password1", "RECIPIENT"))))
                .andReturn()
                .getResponse().getCookie("satoken");
        assertNull(infrastructureServiceMapper.selectW2PPackageGivenUniquePackageId("w2p114514"));
        MockHttpServletRequestBuilder requestBuilder = put("/api/v1/client/package")
                .cookie(c)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new PackageFormData("w2p114514", "fragile", 1.0, 1.0, 2.0, 3.0, "client2", "client1", "loc1", "123.2343,23.32432", "loc2", "123.2443,23.34432", "23:59", new Timestamp(System.currentTimeMillis()), 1, "")));
        MvcResult result = mockMvc.perform(requestBuilder)
                .andDo(MockMvcResultHandlers.print())
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andReturn();
        String content = result.getResponse().getContentAsString();
        assertNotNull(infrastructureServiceMapper.selectW2PPackageGivenUniquePackageId("w2p114514"));
    }
}

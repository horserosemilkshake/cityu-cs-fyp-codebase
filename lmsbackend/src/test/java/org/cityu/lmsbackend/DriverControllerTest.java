package org.cityu.lmsbackend;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.cityu.lmsbackend.utils.*;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.test.web.servlet.result.MockMvcResultHandlers;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;

import javax.servlet.http.Cookie;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;

@SpringBootTest(classes = LmsbackendApplication.class)
@AutoConfigureMockMvc
@ActiveProfiles({"test"})
public class DriverControllerTest {
    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("Get available P2P package after logging in.")
    void testGetPackage01() throws Exception {
        Cookie c = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequestData("driver1", "password1", "DRIVER"))))
                .andReturn()
                .getResponse().getCookie("satoken");
        MockHttpServletRequestBuilder requestBuilder = post("/api/v1/driver/package")
                .cookie(c)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new PackageGetRequestData("driver1", 0)));
        MvcResult result = mockMvc.perform(requestBuilder)
                .andDo(MockMvcResultHandlers.print())
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andReturn();
        assertNotEquals("{}", result.getResponse().getContentAsString());
    }

    @Test
    @DisplayName("Get available W2P package after logging in.")
    void testGetPackage02() throws Exception {
        Cookie c = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequestData("driver1", "password1", "DRIVER"))))
                .andReturn()
                .getResponse().getCookie("satoken");
        MockHttpServletRequestBuilder requestBuilder = post("/api/v1/driver/package")
                .cookie(c)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new PackageGetRequestData("driver1", 1)));
        MvcResult result = mockMvc.perform(requestBuilder)
                .andDo(MockMvcResultHandlers.print())
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andReturn();
        assertNotEquals("{}", result.getResponse().getContentAsString());
    }

    @Test
    @DisplayName("Get driver profile after logging in.")
    void testDriverProfile() throws Exception {
        Cookie c = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequestData("driver1", "password1", "DRIVER"))))
                .andReturn()
                .getResponse().getCookie("satoken");
        MockHttpServletRequestBuilder requestBuilder = post("/api/v1/driver/user-info")
                .cookie(c)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new GetDriverInfoData("driver1")));
        MvcResult result = mockMvc.perform(requestBuilder)
                .andDo(MockMvcResultHandlers.print())
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andReturn();
        assertNotEquals("{}", result.getResponse().getContentAsString());
    }

    @Test
    @DisplayName("Update position after logging in.")
    void testUpdatePosition() throws Exception {
        Cookie c = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequestData("driver1", "password1", "DRIVER"))))
                .andReturn()
                .getResponse().getCookie("satoken");
        MockHttpServletRequestBuilder requestBuilder = put("/api/v1/driver/update-position")
                .cookie(c)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new GetDriverPositionInfoData("driver1", "22.3745317,113.9655417", "22.3745317,113.9655417", 5.0)));
        MvcResult result = mockMvc.perform(requestBuilder)
                .andDo(MockMvcResultHandlers.print())
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andReturn();
        assertNotEquals("{}", result.getResponse().getContentAsString());
    }

    @Test
    @DisplayName("Occupy a p2p package after logging in.")
    void testOccupy01() throws Exception {
        Cookie c = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequestData("driver1", "password1", "DRIVER"))))
                .andReturn()
                .getResponse().getCookie("satoken");
        MockHttpServletRequestBuilder requestBuilder = put("/api/v1/driver/package")
                .cookie(c)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new GetDriverSelectedPackageData("driver1", new ArrayList<String>() {{add("p2p001");}}, 0)));
        MvcResult result = mockMvc.perform(requestBuilder)
                .andDo(MockMvcResultHandlers.print())
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andReturn();
        assertNotEquals("{}", result.getResponse().getContentAsString());
    }

    @Test
    @DisplayName("Occupy a w2p package after logging in.")
    void testOccupy02() throws Exception {
        Cookie c = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequestData("driver1", "password1", "DRIVER"))))
                .andReturn()
                .getResponse().getCookie("satoken");
        MockHttpServletRequestBuilder requestBuilder = put("/api/v1/driver/package")
                .cookie(c)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new GetDriverSelectedPackageData("driver1", new ArrayList<String>() {{add("w2p001");}}, 1)));
        MvcResult result = mockMvc.perform(requestBuilder)
                .andDo(MockMvcResultHandlers.print())
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andReturn();
        assertNotEquals("{}", result.getResponse().getContentAsString());
    }

    @Test
    @DisplayName("Occupy an non-exist package after logging in.")
    void testOccupy03() throws Exception {
        Cookie c = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequestData("driver1", "password1", "DRIVER"))))
                .andReturn()
                .getResponse().getCookie("satoken");
        MockHttpServletRequestBuilder requestBuilder = put("/api/v1/driver/package")
                .cookie(c)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new GetDriverSelectedPackageData("driver1", new ArrayList<String>() {{add("a package that does not exist");}}, 0)));
        MvcResult result = mockMvc.perform(requestBuilder)
                .andDo(MockMvcResultHandlers.print())
                .andExpect(MockMvcResultMatchers.status().is5xxServerError())
                .andReturn();
        assertNotEquals("{}", result.getResponse().getContentAsString());
    }

    @Test
    @DisplayName("Release a p2p package after logging in.")
    void testRelease01() throws Exception {
        Cookie c = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequestData("driver1", "password1", "DRIVER"))))
                .andReturn()
                .getResponse().getCookie("satoken");
        MockHttpServletRequestBuilder requestBuilder = delete("/api/v1/driver/package")
                .cookie(c)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new GetDriverSelectedPackageData("driver1", new ArrayList<String>() {{add("p2p001");}}, 1)));
        MvcResult result = mockMvc.perform(requestBuilder)
                .andDo(MockMvcResultHandlers.print())
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andReturn();
        assertNotEquals("{}", result.getResponse().getContentAsString());
    }

    @Test
    @DisplayName("Release a w2p package after logging in.")
    void testRelease02() throws Exception {
        Cookie c = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequestData("driver1", "password1", "DRIVER"))))
                .andReturn()
                .getResponse().getCookie("satoken");
        MockHttpServletRequestBuilder requestBuilder = delete("/api/v1/driver/package")
                .cookie(c)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new GetDriverSelectedPackageData("driver1", new ArrayList<String>() {{add("w2p001");}}, 0)));
        MvcResult result = mockMvc.perform(requestBuilder)
                .andDo(MockMvcResultHandlers.print())
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andReturn();
        assertNotEquals("{}", result.getResponse().getContentAsString());
    }

    @Test
    @DisplayName("Release an non-exist package after logging in.")
    void testRelease03() throws Exception {
        Cookie c = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequestData("driver1", "password1", "DRIVER"))))
                .andReturn()
                .getResponse().getCookie("satoken");
        MockHttpServletRequestBuilder requestBuilder = delete("/api/v1/driver/package")
                .cookie(c)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new GetDriverSelectedPackageData("driver1", new ArrayList<String>() {{add("a package that does not exist");}}, 0)));
        MvcResult result = mockMvc.perform(requestBuilder)
                .andDo(MockMvcResultHandlers.print())
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andReturn();
        assertNotEquals("{}", result.getResponse().getContentAsString());
    }

    @Test
    @DisplayName("Testing add path.")
    void testAddPath() throws Exception {
        Cookie c = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequestData("driver1", "password1", "DRIVER"))))
                .andReturn()
                .getResponse().getCookie("satoken");
        List<List<Double>> test = new ArrayList<>();
        test.add(new ArrayList<>() {{add(22.3745317); add(113.9655417);}});
        test.add(new ArrayList<>() {{add(22.3745317); add(113.9655417);}});

        MockHttpServletRequestBuilder requestBuilder = post("/api/v1/driver/package")
                .cookie(c)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new GetDriverPath("driver1", test)));
        MvcResult result = mockMvc.perform(requestBuilder)
                .andDo(MockMvcResultHandlers.print())
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andReturn();
        assertNotEquals("{}", result.getResponse().getContentAsString());
    }

    @Test
    @DisplayName("Testing remove path.")
    void testRemovePath() throws Exception {
        Cookie c = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequestData("driver1", "password1", "DRIVER"))))
                .andReturn()
                .getResponse().getCookie("satoken");
        List<List<Double>> test = new ArrayList<>();
        test.add(new ArrayList<>() {{add(22.3745317); add(113.9655417);}});
        test.add(new ArrayList<>() {{add(22.3745317); add(113.9655417);}});

        MockHttpServletRequestBuilder requestBuilder = delete("/api/v1/driver/package")
                .cookie(c)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new GetDriverPath("driver1", test)));
        MvcResult result = mockMvc.perform(requestBuilder)
                .andDo(MockMvcResultHandlers.print())
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andReturn();
        assertNotEquals("{}", result.getResponse().getContentAsString());
    }

    @Test
    @DisplayName("Change online status.")
    void testChangeOnlineStatus() throws Exception {
        Cookie c = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequestData("driver1", "password1", "DRIVER"))))
                .andReturn()
                .getResponse().getCookie("satoken");
        MockHttpServletRequestBuilder requestBuilder = post("/api/v1/driver/user-info")
                .cookie(c)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new GetDriverInfoData("driver1")));
        MvcResult result = mockMvc.perform(requestBuilder)
                .andDo(MockMvcResultHandlers.print())
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andReturn();
        assertTrue(result.getResponse().getContentAsString().contains("\"ready\":true"));
        requestBuilder = post("/api/v1/driver/logout")
                .cookie(c)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new GetDriverInfoData("driver1")));
        result = mockMvc.perform(requestBuilder)
                .andDo(MockMvcResultHandlers.print())
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andReturn();
        assertTrue(result.getResponse().getContentAsString().contains("\"ready\":false"));
    }

    @Test
    @DisplayName("Get trh.")
    void testGetTrh() throws Exception {
        Cookie c = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequestData("driver1", "password1", "DRIVER"))))
                .andReturn()
                .getResponse().getCookie("satoken");
        MockHttpServletRequestBuilder requestBuilder = post("/api/v1/driver/transaction-reference-hash")
                .cookie(c)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new GetTRD("p2p001")));
        MvcResult result = mockMvc.perform(requestBuilder)
                .andDo(MockMvcResultHandlers.print())
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andReturn();
        assertFalse(result.getResponse().getContentAsString().isEmpty());
    }
}

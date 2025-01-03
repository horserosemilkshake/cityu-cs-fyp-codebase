package org.cityu.lmsbackend;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.cityu.lmsbackend.utils.DeleteRequestData;
import org.cityu.lmsbackend.utils.GetDriverInfoData;
import org.cityu.lmsbackend.utils.LoginRequestData;
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

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;

@SpringBootTest(classes = LmsbackendApplication.class)
@AutoConfigureMockMvc
@ActiveProfiles({"test"})
public class AdminControllerTest {
    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("Get admin profile after logging in.")
    void testGetPackage01() throws Exception {
        Cookie c = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequestData("root", "root", "ADMIN"))))
                .andReturn()
                .getResponse().getCookie("satoken");
        MockHttpServletRequestBuilder requestBuilder = post("/api/v1/admin/admin-info")
                .cookie(c);
        MvcResult result = mockMvc.perform(requestBuilder)
                .andDo(MockMvcResultHandlers.print())
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andReturn();
        assertEquals("{\"id\":1,\"username\":\"root\",\"password\":\"\",\"nickname\":null,\"eight_digit_hk_phone_number\":\"65890040\",\"cryptowallet_address\":\"0x3EEf2554B7d4fD4863E95Dd486519F595E09F140\",\"cryptowallet_private_key\":\"\"}", result.getResponse().getContentAsString());
    }

    @Test
    @DisplayName("Get all drivers profile.")
    void testGetAllDrivers() throws Exception {
        Cookie c = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequestData("root", "root", "ADMIN"))))
                .andReturn()
                .getResponse().getCookie("satoken");
        MockHttpServletRequestBuilder requestBuilder = post("/api/v1/admin/get-all-driver")
                .cookie(c);
        MvcResult result = mockMvc.perform(requestBuilder)
                .andDo(MockMvcResultHandlers.print())
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andReturn();
        assertNotEquals("{}", result.getResponse().getContentAsString());
    }

    @Test
    @DisplayName("Get all recipients profile.")
    void testGetAllRecipients() throws Exception {
        Cookie c = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequestData("root", "root", "ADMIN"))))
                .andReturn()
                .getResponse().getCookie("satoken");
        MockHttpServletRequestBuilder requestBuilder = post("/api/v1/admin/get-all-client")
                .cookie(c);
        MvcResult result = mockMvc.perform(requestBuilder)
                .andDo(MockMvcResultHandlers.print())
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andReturn();
        assertNotEquals("{}", result.getResponse().getContentAsString());
    }

    @Test
    @DisplayName("Get all Recipient-to-recipient packages.")
    void testGetAllP2P() throws Exception {
        Cookie c = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequestData("root", "root", "ADMIN"))))
                .andReturn()
                .getResponse().getCookie("satoken");
        MockHttpServletRequestBuilder requestBuilder = post("/api/v1/admin/get-all-p2p")
                .cookie(c);
        MvcResult result = mockMvc.perform(requestBuilder)
                .andDo(MockMvcResultHandlers.print())
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andReturn();
        assertNotEquals("{}", result.getResponse().getContentAsString());
    }

    @Test
    @DisplayName("Get all Warehouse-to-recipient packages.")
    void testGetAllW2P() throws Exception {
        Cookie c = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequestData("root", "root", "ADMIN"))))
                .andReturn()
                .getResponse().getCookie("satoken");
        MockHttpServletRequestBuilder requestBuilder = post("/api/v1/admin/get-all-w2p")
                .cookie(c);
        MvcResult result = mockMvc.perform(requestBuilder)
                .andDo(MockMvcResultHandlers.print())
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andReturn();
        assertNotEquals("{}", result.getResponse().getContentAsString());
    }

    @Test
    @DisplayName("Delete non-existence user.")
    void testDeleteUser01() throws Exception {
        Cookie c = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequestData("root", "root", "ADMIN"))))
                .andReturn()
                .getResponse().getCookie("satoken");
        MockHttpServletRequestBuilder requestBuilder = post("/api/v1/admin/delete-account")
                .cookie(c)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new DeleteRequestData("Foo", "RECIPIENT")));;
        MvcResult result = mockMvc.perform(requestBuilder)
                .andDo(MockMvcResultHandlers.print())
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andReturn();
        assertEquals("\"INTERNAL_SERVER_ERROR\"", result.getResponse().getContentAsString());
    }

    @Test
    @DisplayName("Delete non-existence role.")
    void testDeleteUser02() throws Exception {
        Cookie c = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequestData("root", "root", "ADMIN"))))
                .andReturn()
                .getResponse().getCookie("satoken");
        MockHttpServletRequestBuilder requestBuilder = post("/api/v1/admin/delete-account")
                .cookie(c)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new DeleteRequestData("driver1", "EGG")));;
        MvcResult result = mockMvc.perform(requestBuilder)
                .andDo(MockMvcResultHandlers.print())
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andReturn();
        assertEquals("\"INTERNAL_SERVER_ERROR\"", result.getResponse().getContentAsString());
    }
}

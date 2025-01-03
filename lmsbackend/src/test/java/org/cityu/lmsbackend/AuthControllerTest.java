package org.cityu.lmsbackend;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;

import com.fasterxml.jackson.databind.ObjectMapper;
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

@SpringBootTest(classes = LmsbackendApplication.class)
@AutoConfigureMockMvc
@ActiveProfiles({"test"})
class AuthControllerTest {
	@Autowired
	private ObjectMapper objectMapper;
	@Autowired
	private MockMvc mockMvc;

	@Test
	@DisplayName("Get all info status after logging in.")
	void testGetAllInfo02() throws Exception {
		Cookie c = mockMvc.perform(post("/api/v1/auth/login")
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(new LoginRequestData("driver1", "password1", "DRIVER"))))
				.andReturn()
				.getResponse().getCookie("satoken");
		MockHttpServletRequestBuilder requestBuilder = get("/api/v1/auth/session-info")
				.cookie(c);
		MvcResult result = mockMvc.perform(requestBuilder)
				.andDo(MockMvcResultHandlers.print())
				.andExpect(MockMvcResultMatchers.status().isOk())
				.andReturn();
		assertNotEquals("[]", result.getResponse().getContentAsString());

	}

	@Test
	@DisplayName("Driver login successful: correct username and correct password")
	void testGetDriverLoginSuccess() throws Exception {
		MockHttpServletRequestBuilder requestBuilder = post("/api/v1/auth/login")
				.contentType(MediaType.APPLICATION_JSON)
				.content(objectMapper.writeValueAsString(new LoginRequestData("driver1", "password1", "DRIVER")));
		MvcResult result = mockMvc.perform(requestBuilder)
				.andDo(MockMvcResultHandlers.print())
				.andExpect(MockMvcResultMatchers.status().isOk())
				.andReturn();
		assertEquals("{\"code\":200,\"msg\":\"Login successful.\",\"data\":null}", result.getResponse().getContentAsString());
	}

	@Test
	@DisplayName("Driver login failed: correct username and wrong password")
	void testGetDriverLoginFail01() throws Exception {
		MockHttpServletRequestBuilder requestBuilder = post("/api/v1/auth/login")
				.contentType(MediaType.APPLICATION_JSON)
				.content(objectMapper.writeValueAsString(new LoginRequestData("driver1", "114514", "DRIVER")));
		MvcResult result = mockMvc.perform(requestBuilder)
				.andDo(MockMvcResultHandlers.print())
				.andExpect(MockMvcResultMatchers.status().isOk())
				.andReturn();
		assertEquals("{\"code\":500,\"msg\":\"Login failed.\",\"data\":null}", result.getResponse().getContentAsString());
	}

	@Test
	@DisplayName("Driver login failed: wrong username and correct password")
	void testGetDriverLoginFail02() throws Exception {
		MockHttpServletRequestBuilder requestBuilder = post("/api/v1/auth/login")
				.contentType(MediaType.APPLICATION_JSON)
				.content(objectMapper.writeValueAsString(new LoginRequestData("114514", "password1", "DRIVER")));
		MvcResult result = mockMvc.perform(requestBuilder)
				.andDo(MockMvcResultHandlers.print())
				.andExpect(MockMvcResultMatchers.status().isOk())
				.andReturn();
		assertEquals("{\"code\":500,\"msg\":\"Login failed.\",\"data\":null}", result.getResponse().getContentAsString());
	}

	@Test
	@DisplayName("Driver login failed: wrong username and wrong password")
	void testGetDriverLoginFail03() throws Exception {
		MockHttpServletRequestBuilder requestBuilder = post("/api/v1/auth/login")
				.contentType(MediaType.APPLICATION_JSON)
				.content(objectMapper.writeValueAsString(new LoginRequestData("114514", "114514", "DRIVER")));
		MvcResult result = mockMvc.perform(requestBuilder)
				.andDo(MockMvcResultHandlers.print())
				.andExpect(MockMvcResultMatchers.status().isOk())
				.andReturn();
		assertEquals("{\"code\":500,\"msg\":\"Login failed.\",\"data\":null}", result.getResponse().getContentAsString());
	}

	@Test
	@DisplayName("Recipient login successful: correct username and correct password")
	void testGetRecipientLoginSuccess() throws Exception {
		MockHttpServletRequestBuilder requestBuilder = post("/api/v1/auth/login")
				.contentType(MediaType.APPLICATION_JSON)
				.content(objectMapper.writeValueAsString(new LoginRequestData("client1", "password1", "RECIPIENT")));
		MvcResult result = mockMvc.perform(requestBuilder)
				.andDo(MockMvcResultHandlers.print())
				.andExpect(MockMvcResultMatchers.status().isOk())
				.andReturn();
		assertEquals("{\"code\":200,\"msg\":\"Login successful.\",\"data\":null}", result.getResponse().getContentAsString());
	}

	@Test
	@DisplayName("Recipient login failed: correct username and wrong password")
	void testGetRecipientLoginFail01() throws Exception {
		MockHttpServletRequestBuilder requestBuilder = post("/api/v1/auth/login")
				.contentType(MediaType.APPLICATION_JSON)
				.content(objectMapper.writeValueAsString(new LoginRequestData("client1", "114514", "RECIPIENT")));
		MvcResult result = mockMvc.perform(requestBuilder)
				.andDo(MockMvcResultHandlers.print())
				.andExpect(MockMvcResultMatchers.status().isOk())
				.andReturn();
		assertEquals("{\"code\":500,\"msg\":\"Login failed.\",\"data\":null}", result.getResponse().getContentAsString());
	}

	@Test
	@DisplayName("Recipient login failed: wrong username and correct password")
	void testGetRecipientLoginFail02() throws Exception {
		MockHttpServletRequestBuilder requestBuilder = post("/api/v1/auth/login")
				.contentType(MediaType.APPLICATION_JSON)
				.content(objectMapper.writeValueAsString(new LoginRequestData("114514", "password1", "RECIPIENT")));
		MvcResult result = mockMvc.perform(requestBuilder)
				.andDo(MockMvcResultHandlers.print())
				.andExpect(MockMvcResultMatchers.status().isOk())
				.andReturn();
		assertEquals("{\"code\":500,\"msg\":\"Login failed.\",\"data\":null}", result.getResponse().getContentAsString());
	}

	@Test
	@DisplayName("Recipient login failed: wrong username and wrong password")
	void testGetRecipientLoginFail03() throws Exception {
		MockHttpServletRequestBuilder requestBuilder = post("/api/v1/auth/login")
				.contentType(MediaType.APPLICATION_JSON)
				.content(objectMapper.writeValueAsString(new LoginRequestData("114514", "114514", "RECIPIENT")));
		MvcResult result = mockMvc.perform(requestBuilder)
				.andDo(MockMvcResultHandlers.print())
				.andExpect(MockMvcResultMatchers.status().isOk())
				.andReturn();
		assertEquals("{\"code\":500,\"msg\":\"Login failed.\",\"data\":null}", result.getResponse().getContentAsString());
	}

	@Test
	@DisplayName("Admin login successful: correct username and correct password")
	void testGetAdminLoginSuccess() throws Exception {
		MockHttpServletRequestBuilder requestBuilder = post("/api/v1/auth/login")
				.contentType(MediaType.APPLICATION_JSON)
				.content(objectMapper.writeValueAsString(new LoginRequestData("root", "root", "ADMIN")));
		MvcResult result = mockMvc.perform(requestBuilder)
				.andDo(MockMvcResultHandlers.print())
				.andExpect(MockMvcResultMatchers.status().isOk())
				.andReturn();
		assertEquals("{\"code\":200,\"msg\":\"Login successful.\",\"data\":null}", result.getResponse().getContentAsString());
	}

	@Test
	@DisplayName("Admin login failed: correct username and wrong password")
	void testGetAdminLoginFail01() throws Exception {
		MockHttpServletRequestBuilder requestBuilder = post("/api/v1/auth/login")
				.contentType(MediaType.APPLICATION_JSON)
				.content(objectMapper.writeValueAsString(new LoginRequestData("root", "114514", "ADMIN")));
		MvcResult result = mockMvc.perform(requestBuilder)
				.andDo(MockMvcResultHandlers.print())
				.andExpect(MockMvcResultMatchers.status().isOk())
				.andReturn();
		assertEquals("{\"code\":500,\"msg\":\"Login failed.\",\"data\":null}", result.getResponse().getContentAsString());
	}

	@Test
	@DisplayName("Admin login failed: wrong username and correct password")
	void testGetAdminLoginFail02() throws Exception {
		MockHttpServletRequestBuilder requestBuilder = post("/api/v1/auth/login")
				.contentType(MediaType.APPLICATION_JSON)
				.content(objectMapper.writeValueAsString(new LoginRequestData("114514", "root", "ADMIN")));
		MvcResult result = mockMvc.perform(requestBuilder)
				.andDo(MockMvcResultHandlers.print())
				.andExpect(MockMvcResultMatchers.status().isOk())
				.andReturn();
		assertEquals("{\"code\":500,\"msg\":\"Login failed.\",\"data\":null}", result.getResponse().getContentAsString());
	}

	@Test
	@DisplayName("Admin login failed: wrong username and wrong password")
	void testGetAdminLoginFail03() throws Exception {
		MockHttpServletRequestBuilder requestBuilder = post("/api/v1/auth/login")
				.contentType(MediaType.APPLICATION_JSON)
				.content(objectMapper.writeValueAsString(new LoginRequestData("114514", "114514", "ADMIN")));
		MvcResult result = mockMvc.perform(requestBuilder)
				.andDo(MockMvcResultHandlers.print())
				.andExpect(MockMvcResultMatchers.status().isOk())
				.andReturn();
		assertEquals("{\"code\":500,\"msg\":\"Login failed.\",\"data\":null}", result.getResponse().getContentAsString());
	}

	@Test
	@DisplayName("Get login status when not logged in.")
	void testLoginStatus01() throws Exception {
		MockHttpServletRequestBuilder requestBuilder = get("/api/v1/auth/logged-in");
		MvcResult result = mockMvc.perform(requestBuilder)
				.andDo(MockMvcResultHandlers.print())
				.andExpect(MockMvcResultMatchers.status().isOk())
				.andReturn();
		assertEquals("{\"code\":200,\"msg\":\"Current session logged in: false\",\"data\":null}", result.getResponse().getContentAsString());
	}

	@Test
	@DisplayName("Get login status after logging in.")
	void testLoginStatus02() throws Exception {
		Cookie c = mockMvc.perform(post("/api/v1/auth/login")
				.contentType(MediaType.APPLICATION_JSON)
				.content(objectMapper.writeValueAsString(new LoginRequestData("driver1", "password1", "DRIVER"))))
				.andReturn()
				.getResponse().getCookie("satoken");
		MockHttpServletRequestBuilder requestBuilder = get("/api/v1/auth/logged-in")
				.cookie(c);
		MvcResult result = mockMvc.perform(requestBuilder)
				.andDo(MockMvcResultHandlers.print())
				.andExpect(MockMvcResultMatchers.status().isOk())
				.andReturn();
		assertEquals("{\"code\":200,\"msg\":\"Current session logged in: true\",\"data\":null}", result.getResponse().getContentAsString());
	}

	@Test
	@DisplayName("Get token info status before logging in.")
	void testGetTokenInfo01() throws Exception {
		MockHttpServletRequestBuilder requestBuilder = get("/api/v1/auth/token-info");
		MvcResult result = mockMvc.perform(requestBuilder)
				.andDo(MockMvcResultHandlers.print())
				.andExpect(MockMvcResultMatchers.status().isOk())
				.andReturn();
		assertEquals(false, result.getResponse().getContentAsString().contains("\"isLogin\":true"));
	}

	@Test
	@DisplayName("Get token info status after logging in.")
	void testGetTokenInfo02() throws Exception {
		Cookie c = mockMvc.perform(post("/api/v1/auth/login")
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(new LoginRequestData("driver1", "password1", "DRIVER"))))
				.andReturn()
				.getResponse().getCookie("satoken");
		MockHttpServletRequestBuilder requestBuilder = get("/api/v1/auth/token-info")
				.cookie(c);
		MvcResult result = mockMvc.perform(requestBuilder)
				.andDo(MockMvcResultHandlers.print())
				.andExpect(MockMvcResultMatchers.status().isOk())
				.andReturn();
		assertEquals(true, result.getResponse().getContentAsString().contains("\"isLogin\":true"));
	}

	@Test
	@DisplayName("Get session info status before logging in.")
	void testGetSessionInfo01() throws Exception {
		MockHttpServletRequestBuilder requestBuilder = get("/api/v1/auth/session-info");
		MvcResult result = mockMvc.perform(requestBuilder)
				.andDo(MockMvcResultHandlers.print())
				.andExpect(MockMvcResultMatchers.status().isUnauthorized())
				.andReturn();
		assertEquals("Token not provided.", result.getResponse().getContentAsString());
	}

	@Test
	@DisplayName("Get session info status after logging in.")
	void testGetSessionInfo02() throws Exception {
		Cookie c = mockMvc.perform(post("/api/v1/auth/login")
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(new LoginRequestData("driver1", "password1", "DRIVER"))))
				.andReturn()
				.getResponse().getCookie("satoken");
		MockHttpServletRequestBuilder requestBuilder = get("/api/v1/auth/session-info")
				.cookie(c);
		MvcResult result = mockMvc.perform(requestBuilder)
				.andDo(MockMvcResultHandlers.print())
				.andExpect(MockMvcResultMatchers.status().isOk())
				.andReturn();
		assertEquals(true, result.getResponse().getContentAsString().contains("createTime"));
	}

	@Test
	@DisplayName("Get roles before logging in.")
	void testGetRoleInfo01() throws Exception {
		MockHttpServletRequestBuilder requestBuilder = get("/api/v1/auth/get-roles");
		MvcResult result = mockMvc.perform(requestBuilder)
				.andDo(MockMvcResultHandlers.print())
				.andExpect(MockMvcResultMatchers.status().isOk())
				.andReturn();
		assertEquals("[]", result.getResponse().getContentAsString());
	}

	@Test
	@DisplayName("Get role after logging in.")
	void testGetRoleInfo02() throws Exception {
		Cookie c = mockMvc.perform(post("/api/v1/auth/login")
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(new LoginRequestData("driver1", "password1", "DRIVER"))))
				.andReturn()
				.getResponse().getCookie("satoken");
		MockHttpServletRequestBuilder requestBuilder = get("/api/v1/auth/get-roles")
				.cookie(c);
		MvcResult result = mockMvc.perform(requestBuilder)
				.andDo(MockMvcResultHandlers.print())
				.andExpect(MockMvcResultMatchers.status().isOk())
				.andReturn();
		assertNotEquals("[]", result.getResponse().getContentAsString());
	}

	@Test
	@DisplayName("Get permissions before logging in.")
	void testGetPermissionInfo01() throws Exception {
		MockHttpServletRequestBuilder requestBuilder = get("/api/v1/auth/get-permissions");
		MvcResult result = mockMvc.perform(requestBuilder)
				.andDo(MockMvcResultHandlers.print())
				.andExpect(MockMvcResultMatchers.status().isOk())
				.andReturn();
		assertEquals("[]", result.getResponse().getContentAsString());
	}

	@Test
	@DisplayName("Get permissions after logging in.")
	void testGetPermissionInfo02() throws Exception {
		Cookie c = mockMvc.perform(post("/api/v1/auth/login")
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(new LoginRequestData("driver1", "password1", "DRIVER"))))
				.andReturn()
				.getResponse().getCookie("satoken");
		MockHttpServletRequestBuilder requestBuilder = get("/api/v1/auth/get-permissions")
				.cookie(c);
		MvcResult result = mockMvc.perform(requestBuilder)
				.andDo(MockMvcResultHandlers.print())
				.andExpect(MockMvcResultMatchers.status().isOk())
				.andReturn();
		assertEquals("[]", result.getResponse().getContentAsString());
	}

	@Test
	@DisplayName("Get all session.")
	void testGetAllSession() throws Exception {
		MockHttpServletRequestBuilder requestBuilder = get("/api/v1/auth/get-all-sessions");
		MvcResult result = mockMvc.perform(requestBuilder)
				.andDo(MockMvcResultHandlers.print())
				.andExpect(MockMvcResultMatchers.status().isOk())
				.andReturn();
	}

	@Test
	@DisplayName("Log out before logging in.")
	void testLogout01() throws Exception {
		MockHttpServletRequestBuilder requestBuilder = delete("/api/v1/auth/logout");
		MvcResult result = mockMvc.perform(requestBuilder)
				.andDo(MockMvcResultHandlers.print())
				.andExpect(MockMvcResultMatchers.status().isOk())
				.andReturn();
		assertEquals("{\"code\":200,\"msg\":\"ok\",\"data\":null}", result.getResponse().getContentAsString()); // phony logout action
	}

	@Test
	@DisplayName("Log out after logging in.")
	void testLogout02() throws Exception {
		Cookie c = mockMvc.perform(post("/api/v1/auth/login")
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(new LoginRequestData("driver1", "password1", "DRIVER"))))
				.andReturn()
				.getResponse().getCookie("satoken");
		MockHttpServletRequestBuilder requestBuilder = delete("/api/v1/auth/logout")
				.cookie(c);
		MvcResult result = mockMvc.perform(requestBuilder)
				.andDo(MockMvcResultHandlers.print())
				.andExpect(MockMvcResultMatchers.status().isOk())
				.andReturn();
		assertEquals("{\"code\":200,\"msg\":\"ok\",\"data\":null}", result.getResponse().getContentAsString());
	}
}
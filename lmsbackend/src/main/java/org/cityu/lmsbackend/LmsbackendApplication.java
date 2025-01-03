package org.cityu.lmsbackend;

import java.io.BufferedReader;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.ReadListener;
import javax.servlet.ServletException;
import javax.servlet.ServletInputStream;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletRequestWrapper;

import org.apache.tomcat.util.http.fileupload.IOUtils;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.util.StreamUtils;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@SpringBootApplication
@CrossOrigin
public class LmsbackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(LmsbackendApplication.class, args);
	}
//
//
//    @Bean
//    public FilterRegistrationBean<RequestLoggingFilter> loggingFilter() {
//        FilterRegistrationBean<RequestLoggingFilter> registrationBean = new FilterRegistrationBean<>();
//        registrationBean.setFilter(new RequestLoggingFilter());
//        registrationBean.addUrlPatterns("/*");
//        return registrationBean;
//    }
//
//    public static class RequestLoggingFilter implements Filter {
//
//        @Override
//        public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
//            HttpServletRequest httpServletRequest = (HttpServletRequest) request;
//            RequestWrapper requestWrapper = new RequestWrapper(httpServletRequest);
//            String requestBody = requestWrapper.getRequestBody();
//
//            // Print the request body
//            System.out.println("Request Body: " + requestBody);
//
//            // Continue the filter chain
//            chain.doFilter(requestWrapper, response);
//        }
//
//        // Other methods of the Filter interface
//
//    }
//
//    public static class RequestWrapper extends HttpServletRequestWrapper {
//
//        private final byte[] requestBody;
//
//        public RequestWrapper(HttpServletRequest request) throws IOException {
//            super(request);
//            requestBody = StreamUtils.copyToByteArray(request.getInputStream());
//        }
//
//        @Override
//        public ServletInputStream getInputStream() throws IOException {
//            final ByteArrayInputStream byteArrayInputStream = new ByteArrayInputStream(requestBody);
//            return new ServletInputStream() {
//                public int read() throws IOException {
//                    return byteArrayInputStream.read();
//                }
//
//				@Override
//				public boolean isFinished() {
//					// TODO Auto-generated method stub
//					return false;
//				}
//
//				@Override
//				public boolean isReady() {
//					// TODO Auto-generated method stub
//					return false;
//				}
//
//				@Override
//				public void setReadListener(ReadListener listener) {
//					// TODO Auto-generated method stub
//
//				}
//            };
//        }
//
//        @Override
//        public BufferedReader getReader() throws IOException {
//            return new BufferedReader(new java.io.InputStreamReader(getInputStream(), StandardCharsets.UTF_8));
//        }
//
//        public String getRequestBody() {
//            return new String(requestBody, StandardCharsets.UTF_8);
//        }
//    }
}

package org.cityu.lmsbackend.config;

import cn.dev33.satoken.context.SaHolder;
import cn.dev33.satoken.filter.SaServletFilter;
import cn.dev33.satoken.router.SaHttpMethod;
import cn.dev33.satoken.router.SaRouter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import cn.dev33.satoken.interceptor.SaInterceptor;

@Configuration
public class SaTokenConfigure implements WebMvcConfigurer {
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new SaInterceptor()).addPathPatterns("/**");
    }

//    @Bean
//    public SaServletFilter getSaServletFilter() {
//        return new SaServletFilter()
//                // 拦截与排除 path
//                .addInclude("/**").addExclude("/favicon.ico")
//
//                // 全局认证函数
//                .setAuth(obj -> {
//                    // ...
//                })
//
//                // 异常处理函数
//                .setError(e -> {
//                    return e.getMessage();
//                })
//
//                // 前置函数：在每次认证函数之前执行
//                .setBeforeAuth(obj -> {
//                    // ---------- 设置跨域响应头 ----------
//                    SaHolder.getResponse()
//                            // 允许指定域访问跨域资源
//                            .setHeader("Access-Control-Allow-Origin", "*")
//                            // 允许所有请求方式
//                            .setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS, DELETE")
//                            // 有效时间
//                            .setHeader("Access-Control-Max-Age", "3600")
//                            // 允许的header参数
//                            .setHeader("Access-Control-Allow-Headers", "*");
//
//                    // 如果是预检请求，则立即返回到前端
//                    SaRouter.match(SaHttpMethod.OPTIONS)
//                            .free(r -> System.out.println("--------OPTIONS预检请求，不做处理"))
//                            .back();
//                })
//                ;
//    }
}
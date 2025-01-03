package org.cityu.lmsbackend.config;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import cn.dev33.satoken.exception.NotLoginException;
import cn.dev33.satoken.exception.NotPermissionException;
import cn.dev33.satoken.exception.NotRoleException;

@RestControllerAdvice
public class SaTokenExceptionHandler {
    @ExceptionHandler(NotLoginException.class)
    public ResponseEntity<String> handlerNotLoginException(NotLoginException nle) {
        String message = "";
        if (nle.getType().equals(NotLoginException.NOT_TOKEN)) {
            message = "Token not provided.";
        } else if (nle.getType().equals(NotLoginException.INVALID_TOKEN)) {
            message = "Valid token not provided.";
        } else if (nle.getType().equals(NotLoginException.TOKEN_TIMEOUT)) {
            message = "Login expired. Please login again.";
        } else if (nle.getType().equals(NotLoginException.BE_REPLACED)) {
            message = "Your account is logged in on another device.";
        } else if (nle.getType().equals(NotLoginException.KICK_OUT)) {
            message = "System forced you offline.";
        } else {
            message = "Current session not logged in.";
        }
        return new ResponseEntity<String>(message, null, 401);
    }

    @ExceptionHandler
    public ResponseEntity<String> handlerNotRoleException(NotRoleException e) {
        return new ResponseEntity<String>("No Such Role.", null, 401);
    }

    @ExceptionHandler
    public ResponseEntity<String> handlerNotPermissionException(NotPermissionException e) {
        return new ResponseEntity<String>("No Such Permission.", null, 401);
    }

}

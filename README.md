# Login Service API

This is a login service that provides the opportunity for users to register, login, search for other users and delete their profile.
<br>
Users can also restore and reset their password.

## Documentation
The documenation for the API can be found here: https://app.swaggerhub.com/apis-docs/alillje/Login-Service/1.0.0

## Authentication & Authorization
The API uses `JWT` (JSON Web Token) for authorization. 
Once logged in with valid credentials, use the JWT you get in return as `Bearer Authorization` when making requests to endpoints for authorized users. 
<br>
<b>The access token will be valid for an hour (60 minutes), you will then have to login again to obtain a new access token</b>
<br>

## Resetting password 
**If you have forgotten your password**, send request to `/password/restore`, according to the documentation. 
<br>
You will recieve temporary a JWT to the provided email valid only for resetting your password.
Please ensure to check trash email.
<br>
<br>
Use this token to reset your password by sending request to `/password/reset` accoring to the documentation.
<br>
<b>The token to reset your password will be valid for 5 minutes.</b>

## End points
End points are defined in the <a href="https://app.swaggerhub.com/apis-docs/alillje/Login-Service/1.0.0">documentaion</a>.
<br>
Here's a plain list of the different endpoints and request types:
<br>

- POST `/register`
- POST `/login`
- POST `/password/restore`
- PATCH `/password/reset`
- GET `/users`
- DELETE `/users/:id`